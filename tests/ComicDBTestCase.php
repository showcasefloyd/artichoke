<?php
namespace Tests;

use PHPUnit\Framework\TestCase;

/**
 * Base class for all ComicDB integration tests.
 *
 * Truncates all data tables in reverse FK order before each test so every
 * test starts with a clean slate without dropping/recreating the schema.
 */
abstract class ComicDBTestCase extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->truncateTables();

        // Reset the cached DB connection so ComicDB_DB::db() re-connects
        // cleanly for each test (guards against stale state between tests).
        unset($GLOBALS['ComicDB_db']);
    }

    private function truncateTables(): void
    {
        $pdo = $this->pdo();
        $pdo->exec("SET FOREIGN_KEY_CHECKS=0");
        foreach (['issues', 'series', 'publisher'] as $table) {
            $pdo->exec("TRUNCATE TABLE `$table`");
        }
        $pdo->exec("SET FOREIGN_KEY_CHECKS=1");
    }

    /** Returns a PDO connected to the test database. */
    protected function pdo(): \PDO
    {
        $host   = getenv('ARTICHOKE_DB_HOST') ?: 'localhost';
        $user   = getenv('ARTICHOKE_DB_USER') ?: 'comicdb';
        $pass   = getenv('ARTICHOKE_DB_PASS') ?: 'comicdb';
        $testDb = getenv('ARTICHOKE_TEST_DB') ?: 'comicdb_test';

        return new \PDO("mysql:host=$host;dbname=$testDb", $user, $pass, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        ]);
    }

    /** Asserts that no row with $id exists in $table. */
    protected function assertRowDeleted(string $table, int $id): void
    {
        $stmt = $this->pdo()->prepare("SELECT COUNT(*) FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        $this->assertSame(0, (int) $stmt->fetchColumn(), "Row $id should not exist in $table");
    }
}

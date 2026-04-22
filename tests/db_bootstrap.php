<?php
/**
 * Creates (or recreates) the test database schema before each PHPUnit run.
 *
 * Connects as root (or ARTICHOKE_DB_ROOT_USER) to CREATE the test database
 * and GRANT access to the app user, then rebuilds the schema from the
 * canonical bootstrap SQL. Regular app credentials are used for actual tests.
 *
 * Env vars:
 *   ARTICHOKE_DB_HOST         – default: localhost
 *   ARTICHOKE_DB_USER         – default: comicdb   (app user)
 *   ARTICHOKE_DB_PASS         – default: comicdb
 *   ARTICHOKE_TEST_DB         – default: comicdb_test
 *   ARTICHOKE_DB_ROOT_USER    – default: root
 *   ARTICHOKE_DB_ROOT_PASS    – default: root
 */

$host     = getenv('ARTICHOKE_DB_HOST') ?: 'localhost';
$appUser  = getenv('ARTICHOKE_DB_USER') ?: 'comicdb';
$appPass  = getenv('ARTICHOKE_DB_PASS') ?: 'comicdb';
$testDb   = getenv('ARTICHOKE_TEST_DB') ?: 'comicdb_test';
$rootUser = getenv('ARTICHOKE_DB_ROOT_USER') ?: 'root';
$rootPass = getenv('ARTICHOKE_DB_ROOT_PASS') ?: 'root';

// Connect as root so we can CREATE the test database and GRANT privileges.
$pdo = new PDO("mysql:host=$host", $rootUser, $rootPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$pdo->exec("CREATE DATABASE IF NOT EXISTS `$testDb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("GRANT ALL PRIVILEGES ON `$testDb`.* TO '$appUser'@'%'");
$pdo->exec("FLUSH PRIVILEGES");
$pdo->exec("USE `$testDb`");

// Drop all tables for a clean slate on every run.
$pdo->exec("SET FOREIGN_KEY_CHECKS=0");
foreach ($pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN) as $table) {
    $pdo->exec("DROP TABLE IF EXISTS `$table`");
}
$pdo->exec("SET FOREIGN_KEY_CHECKS=1");

// Re-apply the canonical schema targeting the test DB.
$sql = file_get_contents(__DIR__ . '/../app/sql/bootstrap_mysql.sql');
$sql = preg_replace('/^USE\s+\w+\s*;/mi', "USE `$testDb`;", $sql);
$sql = preg_replace('/CREATE DATABASE IF NOT EXISTS \w+/i', "CREATE DATABASE IF NOT EXISTS `$testDb`", $sql);

foreach (array_filter(array_map('trim', explode(';', $sql))) as $stmt) {
    $pdo->exec($stmt);
}

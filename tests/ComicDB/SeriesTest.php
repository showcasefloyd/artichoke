<?php
namespace Tests\ComicDB;

use Tests\ComicDBTestCase;

require_once __DIR__ . '/../../app/lib/ComicDB/DB.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Object.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Publisher.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Serieses.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Issues.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Series.php';

class SeriesTest extends ComicDBTestCase
{
    private int $publisherId;

    protected function setUp(): void
    {
        parent::setUp();

        $publisher = new \ComicDB_Publisher();
        $publisher->name('Test Publisher');
        $publisher->save();
        $this->publisherId = (int) $publisher->id();
    }

    // ------------------------------------------------------------------ create

    public function testInsertPersistsSeries(): void
    {
        $series = new \ComicDB_Series();
        $series->publisherId($this->publisherId);
        $series->name('Test Series');
        $series->save();

        $this->assertGreaterThan(0, $series->id());
    }

    public function testInsertedSeriesCanBeRestored(): void
    {
        $series = new \ComicDB_Series();
        $series->publisherId($this->publisherId);
        $series->name('Restorable Series');
        $series->firstIssue(1);
        $series->finalIssue(12);
        $series->save();
        $id = $series->id();

        $loaded = new \ComicDB_Series($id);
        $loaded->restore();

        $this->assertSame('Restorable Series', $loaded->name());
        $this->assertSame((string) $this->publisherId, (string) $loaded->publisherId());
    }

    // ------------------------------------------------------------------ update

    public function testUpdateChangesName(): void
    {
        $series = new \ComicDB_Series();
        $series->publisherId($this->publisherId);
        $series->name('Before Update');
        $series->save();
        $id = $series->id();

        $series->name('After Update');
        $series->save();

        $loaded = new \ComicDB_Series($id);
        $loaded->restore();
        $this->assertSame('After Update', $loaded->name());
    }

    public function testUpdateOptionalFields(): void
    {
        $series = new \ComicDB_Series();
        $series->publisherId($this->publisherId);
        $series->name('Optional Fields Series');
        $series->save();
        $id = $series->id();

        $series->firstIssue(5);
        $series->finalIssue(50);
        $series->totalIssues(60);
        $series->subscribed(1);
        $series->comments('Great run');
        $series->save();

        $loaded = new \ComicDB_Series($id);
        $loaded->restore();
        $this->assertSame('5', (string) $loaded->firstIssue());
        $this->assertSame('50', (string) $loaded->finalIssue());
        $this->assertSame('60', (string) $loaded->totalIssues());
        $this->assertSame('1', (string) $loaded->subscribed());
        $this->assertSame('Great run', $loaded->comments());
    }

    // ------------------------------------------------------------------ delete

    public function testDeleteRemovesSeries(): void
    {
        $series = new \ComicDB_Series();
        $series->publisherId($this->publisherId);
        $series->name('Series To Delete');
        $series->save();
        $id = (int) $series->id();

        $series->remove();

        $this->assertRowDeleted('series', $id);
    }

    // ------------------------------------------------------------------ flags

    public function testAfterSaveFlagsCleared(): void
    {
        $series = new \ComicDB_Series();
        $series->publisherId($this->publisherId);
        $series->name('Flag Series');
        $series->save();

        $this->assertSame(0, $series->isNew);
        $this->assertSame(0, $series->isDirty);
    }
}

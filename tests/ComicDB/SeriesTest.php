<?php

namespace Tests\ComicDB;

use Tests\ComicDBTestCase;

require_once __DIR__ . '/../../app/lib/ComicDB/DB.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Object.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Title.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Serieses.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Issues.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Series.php';

class SeriesTest extends ComicDBTestCase
{
    private int $titleId;

    protected function setUp(): void
    {
        parent::setUp();

        // Every series test needs a parent title.
        $title = new \ComicDB_Title();
        $title->name('Parent Title');
        $title->save();
        $this->titleId = (int)$title->id();
    }

    // ------------------------------------------------------------------ create

    public function testInsertPersistsSeries(): void
    {
        $series = new \ComicDB_Series();
        $series->titleId($this->titleId);
        $series->name('Test Series');
        $series->publisher('Test Publisher');
        $series->save();

        $this->assertGreaterThan(0, $series->id());
    }

    public function testInsertedSeriesCanBeRestored(): void
    {
        $series = new \ComicDB_Series();
        $series->titleId($this->titleId);
        $series->name('Restorable Series');
        $series->publisher('Restorer Publishing');
        $series->firstIssue(1);
        $series->finalIssue(12);
        $series->save();
        $id = $series->id();

        $loaded = new \ComicDB_Series($id);
        $loaded->restore();

        $this->assertSame('Restorable Series', $loaded->name());
        $this->assertSame('Restorer Publishing', $loaded->publisher());
        $this->assertSame((string)$this->titleId, (string)$loaded->titleId());
    }

    // ------------------------------------------------------------------ update

    public function testUpdateChangesName(): void
    {
        $series = new \ComicDB_Series();
        $series->titleId($this->titleId);
        $series->name('Before Update');
        $series->publisher('Some Publisher');
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
        $series->titleId($this->titleId);
        $series->name('Optional Fields Series');
        $series->publisher('Opt Pub');
        $series->save();
        $id = $series->id();

        $series->firstIssue(5);
        $series->finalIssue(50);
        $series->subscribed(1);
        $series->comments('Great run');
        $series->save();

        $loaded = new \ComicDB_Series($id);
        $loaded->restore();
        $this->assertSame('5', (string)$loaded->firstIssue());
        $this->assertSame('50', (string)$loaded->finalIssue());
        $this->assertSame('1', (string)$loaded->subscribed());
        $this->assertSame('Great run', $loaded->comments());
    }

    // ------------------------------------------------------------------ delete

    public function testDeleteRemovesSeries(): void
    {
        $series = new \ComicDB_Series();
        $series->titleId($this->titleId);
        $series->name('Series To Delete');
        $series->publisher('Del Pub');
        $series->save();
        $id = (int)$series->id();

        $series->remove();

        $this->assertRowDeleted('series', $id);
    }

    // ------------------------------------------------------------------ flags

    public function testAfterSaveFlagsCleared(): void
    {
        $series = new \ComicDB_Series();
        $series->titleId($this->titleId);
        $series->name('Flag Series');
        $series->publisher('Flag Pub');
        $series->save();

        $this->assertSame(0, $series->isNew);
        $this->assertSame(0, $series->isDirty);
    }
}

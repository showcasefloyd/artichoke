<?php
namespace Tests\ComicDB;

use Tests\ComicDBTestCase;

require_once __DIR__ . '/../../app/lib/ComicDB/DB.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Object.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Title.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Serieses.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Issues.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Series.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Issue.php';

class IssueTest extends ComicDBTestCase
{
    private int $seriesId;

    protected function setUp(): void
    {
        parent::setUp();

        $title = new \ComicDB_Title();
        $title->name('Issue Test Title');
        $title->save();

        $series = new \ComicDB_Series();
        $series->titleId((int) $title->id());
        $series->name('Issue Test Series');
        $series->publisher('Issue Pub');
        $series->save();

        $this->seriesId = (int) $series->id();
    }

    // ------------------------------------------------------------------ create

    public function testInsertPersistsIssue(): void
    {
        $issue = new \ComicDB_Issue();
        $issue->seriesId($this->seriesId);
        $issue->number('1');
        $issue->save();

        $this->assertGreaterThan(0, $issue->id());
    }

    public function testInsertedIssueCanBeRestored(): void
    {
        $issue = new \ComicDB_Issue();
        $issue->seriesId($this->seriesId);
        $issue->number('42');
        $issue->save();
        $id = $issue->id();

        $loaded = new \ComicDB_Issue($id);
        $loaded->restore();

        $this->assertSame('42', $loaded->number());
        $this->assertSame((string) $this->seriesId, (string) $loaded->seriesId());
    }

    // ------------------------------------------------------------------ update

    public function testUpdateChangesNumber(): void
    {
        $issue = new \ComicDB_Issue();
        $issue->seriesId($this->seriesId);
        $issue->number('5');
        $issue->save();
        $id = $issue->id();

        $issue->number('6');
        $issue->save();

        $loaded = new \ComicDB_Issue($id);
        $loaded->restore();
        $this->assertSame('6', $loaded->number());
    }

    // ------------------------------------------------------------------ condition persistence (known bug)

    /**
     * Verifies that bkcondition round-trips correctly through insert + restore.
     *
     * This exercises the known bug described in README: "Issue condition does
     * not persist correctly." The test is expected to PASS once the bug is
     * fixed. If it fails it documents exactly where the regression lives.
     */
    public function testConditionPersistsThroughInsert(): void
    {
        $issue = new \ComicDB_Issue();
        $issue->seriesId($this->seriesId);
        $issue->number('10');
        $issue->condition('VF');
        $issue->save();
        $id = $issue->id();

        $loaded = new \ComicDB_Issue($id);
        $loaded->restore();

        $this->assertSame('VF', $loaded->condition(), 'Condition should survive an insert+restore cycle');
    }

    public function testConditionPersistsThroughUpdate(): void
    {
        $issue = new \ComicDB_Issue();
        $issue->seriesId($this->seriesId);
        $issue->number('11');
        $issue->save();
        $id = $issue->id();

        $issue->condition('NM');
        $issue->save();

        $loaded = new \ComicDB_Issue($id);
        $loaded->restore();

        $this->assertSame('NM', $loaded->condition(), 'Condition should survive an update+restore cycle');
    }

    public function testStoryTitlePersistsThroughInsertAndUpdate(): void
    {
        $issue = new \ComicDB_Issue();
        $issue->seriesId($this->seriesId);
        $issue->number('77');
        $issue->storyTitle('Origin Story');
        $issue->save();
        $id = $issue->id();

        $loaded = new \ComicDB_Issue($id);
        $loaded->restore();
        $this->assertSame('Origin Story', $loaded->storyTitle());

        $loaded->storyTitle('Retconned Story');
        $loaded->save();

        $reloaded = new \ComicDB_Issue($id);
        $reloaded->restore();
        $this->assertSame('Retconned Story', $reloaded->storyTitle());
    }

    // ------------------------------------------------------------------ delete

    public function testDeleteRemovesIssue(): void
    {
        $issue = new \ComicDB_Issue();
        $issue->seriesId($this->seriesId);
        $issue->number('99');
        $issue->save();
        $id = (int) $issue->id();

        $issue->remove();

        $this->assertRowDeleted('issues', $id);
    }

    // ------------------------------------------------------------------ flags

    public function testAfterSaveFlagsCleared(): void
    {
        $issue = new \ComicDB_Issue();
        $issue->seriesId($this->seriesId);
        $issue->number('1');
        $issue->save();

        $this->assertSame(0, $issue->isNew);
        $this->assertSame(0, $issue->isDirty);
    }
}

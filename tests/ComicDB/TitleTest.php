<?php
namespace Tests\ComicDB;

use Tests\ComicDBTestCase;

/**
 * TitleTest — skipped. The `titles` table was removed in Slice 1.
 * Title functionality is replaced by Publisher (see PublisherTest).
 */
class TitleTest extends ComicDBTestCase
{
    public function testInsertPersistsTitle(): void
    {
        $this->markTestSkipped('titles table removed in Slice 1; use Publisher instead.');
    }

    public function testInsertedTitleCanBeRestored(): void
    {
        $this->markTestSkipped('titles table removed in Slice 1; use Publisher instead.');
    }

    public function testUpdateChangesName(): void
    {
        $this->markTestSkipped('titles table removed in Slice 1; use Publisher instead.');
    }

    public function testDeleteRemovesTitle(): void
    {
        $this->markTestSkipped('titles table removed in Slice 1; use Publisher instead.');
    }

    public function testNewObjectHasIsNewFlag(): void
    {
        $this->markTestSkipped('titles table removed in Slice 1; use Publisher instead.');
    }

    public function testAfterSaveIsNewFlagCleared(): void
    {
        $this->markTestSkipped('titles table removed in Slice 1; use Publisher instead.');
    }
}

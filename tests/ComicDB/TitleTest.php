<?php
namespace Tests\ComicDB;

use Tests\ComicDBTestCase;

require_once __DIR__ . '/../../app/lib/ComicDB/DB.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Object.php';
require_once __DIR__ . '/../../app/lib/ComicDB/Title.php';

class TitleTest extends ComicDBTestCase
{
    // ------------------------------------------------------------------ create

    public function testInsertPersistsTitle(): void
    {
        $title = new \ComicDB_Title();
        $title->name('Test Title');
        $title->save();

        $this->assertGreaterThan(0, $title->id(), 'insert() should set a numeric id');
    }

    public function testInsertedTitleCanBeRestored(): void
    {
        $title = new \ComicDB_Title();
        $title->name('Restorable Title');
        $title->save();
        $id = $title->id();

        $loaded = new \ComicDB_Title($id);
        $loaded->restore();

        $this->assertSame('Restorable Title', $loaded->name());
    }

    // ------------------------------------------------------------------ update

    public function testUpdateChangesName(): void
    {
        $title = new \ComicDB_Title();
        $title->name('Original Name');
        $title->save();
        $id = $title->id();

        $title->name('Updated Name');
        $title->save();

        $loaded = new \ComicDB_Title($id);
        $loaded->restore();
        $this->assertSame('Updated Name', $loaded->name());
    }

    // ------------------------------------------------------------------ delete

    public function testDeleteRemovesTitle(): void
    {
        $title = new \ComicDB_Title();
        $title->name('Title To Delete');
        $title->save();
        $id = (int) $title->id();

        $title->remove();

        $this->assertRowDeleted('titles', $id);
    }

    // ------------------------------------------------------------------ flags

    public function testNewObjectHasIsNewFlag(): void
    {
        $title = new \ComicDB_Title();
        $this->assertSame(1, $title->isNew);
    }

    public function testAfterSaveIsNewFlagCleared(): void
    {
        $title = new \ComicDB_Title();
        $title->name('Flag Test');
        $title->save();
        $this->assertSame(0, $title->isNew);
        $this->assertSame(0, $title->isDirty);
    }
}

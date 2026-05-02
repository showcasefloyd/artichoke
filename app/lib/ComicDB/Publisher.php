<?php

include_once "ComicDB/DB.php";
include_once "ComicDB/Object.php";

class ComicDB_Publisher extends ComicDB_Object
{
    public $name;

    public function __construct(...$args)
    {

        $this->ComicDB_Publisher(...$args);

    }

    public function ComicDB_Publisher($id = null)
    {
        $this->ComicDB_Object($id);
    }

    // accessors

    public function name($name = null)
    {
        if ($name) {
            $this->name    = $name;
            $this->isDirty = 1;
        }
        return $this->name;
    }

    // interface methods

    public function select()
    {
        $query = "SELECT id, name"
            . " FROM publisher WHERE id=$this->id";

        $db = ComicDB_DB::db();
        if (! $result = $db->query($query)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        $row = $result->fetch_array();

        $this->id($row[0]);
        $this->name($row[1]);

        return DB_OK;
    }

    public function update()
    {
        $id    = $this->id();
        $db    = ComicDB_DB::db();
        $name  = $db->real_escape_string($this->name());
        $query = "UPDATE publisher"
            . " SET name='$name' WHERE id=$id";

        return $db->query($query);
    }

    public function delete()
    {
        $id    = $this->id();
        $query = "DELETE FROM publisher"
            . " WHERE id=$id";

        $db = ComicDB_DB::db();
        return $db->query($query);
    }

    public function insert()
    {
        $db    = ComicDB_DB::db();
        $name  = $db->real_escape_string($this->name());
        $query = "INSERT INTO publisher"
            . " VALUES (NULL, '$name')";

        if (! $db->query($query)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        $query = "SELECT id"
            . " FROM publisher"
            . " ORDER BY id DESC"
            . " LIMIT 1";
        if (! $result = $db->query($query)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        $row = $result->fetch_assoc();
        $this->id($row['id']);

        return;
    }
}

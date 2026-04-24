<?php

include_once("ComicDB/DB.php");
include_once("ComicDB/Object.php");

class ComicDB_Publisher extends ComicDB_Object {
    var $name;

    public function __construct(...$args) {

    	$this->ComicDB_Publisher(...$args);

    }


    function ComicDB_Publisher($id=null) {
		$this->ComicDB_Object($id);
    }

    // accessors

    function name($name=null) {
	if ($name) {
	    $this->name = $name;
	    $this->isDirty = 1;
	}
	return $this->name;
    }

    // interface methods

    function select() {
	$query = "SELECT id, name\n"
		. "  FROM publisher\n"
		. " WHERE id=$this->id";

	$db = ComicDB_DB::db();
	if (! $result = $db->query($query)) {
	    die('There was an error running the query [' . $db->error . ']');
	}
	$row = $result->fetch_array();

	$this->id($row[0]);
	$this->name($row[1]);

	return DB_OK;
    }

    function update() {
	$id = $this->id();
	$db = ComicDB_DB::db();
	$name = $db->real_escape_string($this->name());
	$query = "UPDATE publisher\n"
		. "   SET name='$name'\n"
		. " WHERE id=$id";

	return $db->query($query);
    }

    function delete() {
	$id = $this->id();
	$query = "DELETE FROM publisher\n"
		. " WHERE id=$id";

	$db = ComicDB_DB::db();
	return $db->query($query);
    }

    function insert() {
	$db = ComicDB_DB::db();
	$name = $db->real_escape_string($this->name());
	$query = "INSERT INTO publisher\n"
		. "     VALUES (NULL, '$name')";

	if (! $db->query($query)) {
	    die('There was an error running the query [' . $db->error . ']');
	}

	$query = "SELECT id\n"
		. "  FROM publisher\n"
		. " ORDER BY id DESC\n"
		. "  LIMIT 1";
	if (! $result = $db->query($query)) {
	    die('There was an error running the query [' . $db->error . ']');
	}

	$row = $result->fetch_assoc();
	$this->id($row['id']);

	return;
    }
}

?>

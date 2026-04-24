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
	$query = <<<EOT
  SELECT id, name
    FROM publisher
   WHERE id=$this->id
EOT;

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
	$query = <<<EOT
  UPDATE publisher
     SET name='$name'
   WHERE id=$id
EOT;

	return $db->query($query);
    }

    function delete() {
	$id = $this->id();
	$query = <<<EOT
  DELETE FROM publisher
   WHERE id=$id
EOT;

	$db = ComicDB_DB::db();
	return $db->query($query);
    }

    function insert() {
	$db = ComicDB_DB::db();
	$name = $db->real_escape_string($this->name());
	$query = <<<EOT
  INSERT INTO publisher
       VALUES (NULL, '$name')
EOT;

	if (! $db->query($query)) {
	    die('There was an error running the query [' . $db->error . ']');
	}

	$query = <<<EOT
  SELECT id
    FROM publisher
ORDER BY id DESC
   LIMIT 1
EOT;
	if (! $result = $db->query($query)) {
	    die('There was an error running the query [' . $db->error . ']');
	}

	$row = $result->fetch_assoc();
	$this->id($row['id']);

	return;
    }
}

?>

	<?php

include_once("ComicDB/DB.php");
include_once("ComicDB/Object.php");

class ComicDB_SeriesType extends ComicDB_Object {
    var $name;

    public function __construct(...$args) {

    	$this->ComicDB_SeriesType(...$args);

    }


    function ComicDB_SeriesType() {
		$this->ComicDB_Object();
    }

    // accessors

    function name($name=null) {
		if ($name) {
		    $this->name = $name;
		}
		return $this->name;
    }

    // interface methods

    function select() {
	$query = <<<EOT
		SELECT id, name
		FROM series_type
		WHERE id=$this->id
EOT;

	$db = ComicDB_DB::db();

	$row = $db->getRow($query);
	if (ComicDB_DB::isError($row)) {
	    return $row;
	}

	$this->id($row[0]);
	$this->name($row[1]);

	return DB_OK;
    }

    function update() {
		return new PEAR_Error("update not implemented");
    }

    function delete() {
		return new PEAR_Error("delete not implemented");
    }
}

?>

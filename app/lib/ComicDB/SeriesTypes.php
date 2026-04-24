<?php

include_once("ComicDB/SeriesType.php");

class ComicDB_SeriesTypes {
    var $series_types;

    public function __construct(...$args) {

    	$this->ComicDB_SeriesTypes(...$args);

    }


    function ComicDB_SeriesTypes() {
    }

    // public methods

    function getAll() {
	if (isset($series_types)) {
	    return $series_types;
	}

	$query = "SELECT id, name\n"
		. "  FROM series_type\n"
		. " ORDER BY name ASC";

	$db = ComicDB_DB::db();
	if(!$result = $db->query($query)){
		die('There was an error running the query [' . $db->error . ']');
	}

	$series_types = array();
	while ($row = $result->fetch_array()) {
	    $t = new ComicDB_SeriesType();
	    $t->id($row[0]);
	    $t->name($row[1]);
	    array_push($series_types, $t);
	}

	return $series_types;
    }
}

?>

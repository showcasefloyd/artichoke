<?php

include_once("ComicDB/Location.php");

class ComicDB_Locations {
    var $locations;

    public function __construct(...$args) {

    	$this->ComicDB_Locations(...$args);

    }


    function ComicDB_Locations() {
    }

    // public methods

    function getAll() {
	if (isset($locations)) {
	    return $locations;
	}

	$query = "SELECT id, name\n"
		. "  FROM location\n"
		. " ORDER BY name ASC";

	$db = ComicDB_DB::db();
	if(!$result = $db->query($query)){
		die('There was an error running the query [' . $db->error . ']');
	}

	$locations = array();
	while ($row = $result->fetch_array()) {
	    $t = new ComicDB_Location();
	    $t->id($row[0]);
	    $t->name($row[1]);
	    array_push($locations, $t);
	}

	return $locations;
    }
}

?>

<?php

include_once("ComicDB/PrintRun.php");

class ComicDB_PrintRuns {
    var $print_runs;

    public function __construct(...$args) {

    	$this->ComicDB_PrintRuns(...$args);

    }


    function ComicDB_PrintRuns() {
    }

    // public methods

    function getAll() {
	if (isset($print_runs)) {
	    return $print_runs;
	}

	$query = "SELECT id, name\n"
		. "  FROM print_run\n"
		. " ORDER BY name ASC";

	$db = ComicDB_DB::db();
	if(!$result = $db->query($query)){
		die('There was an error running the query [' . $db->error . ']');
	}

	$print_runs = array();
	while ($row = $result->fetch_array()) {
	    $t = new ComicDB_PrintRun();
	    $t->id($row[0]);
	    $t->name($row[1]);
	    array_push($print_runs, $t);
	}

	return $print_runs;
    }
}

?>

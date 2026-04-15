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

	$query = <<<EOT
  SELECT id, name
    FROM print_run
ORDER BY name ASC
EOT;

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

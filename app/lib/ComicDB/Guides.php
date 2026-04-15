<?php

include_once("ComicDB/Guide.php");

class ComicDB_Guides {
    var $guides;

    public function __construct(...$args) {

    	$this->ComicDB_Guides(...$args);

    }


    function ComicDB_Guides() {
    }

    // public methods

    function getAll() {
	if (isset($guides)) {
	    return $guides;
	}

	$query = <<<EOT
  SELECT id, name
    FROM guide
ORDER BY name ASC
EOT;

	$db = ComicDB_DB::db();
	if(!$result = $db->query($query)){
		die('There was an error running the query [' . $db->error . ']');
	}

	$guides = array();
	while ($row = $result->fetch_array()) {
	    $t = new ComicDB_Guide();
	    $t->id($row[0]);
	    $t->name($row[1]);
	    array_push($guides, $t);
	}

	return $guides;
    }
}

?>

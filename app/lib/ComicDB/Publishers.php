<?php

include_once("ComicDB/Publisher.php");

class ComicDB_Publishers {

    var $publishers;

    public function __construct(...$args) {

    	$this->ComicDB_Publishers(...$args);

    }


    function ComicDB_Publishers() {

    }

    // public methods
    function getAll() {

		if (isset($publishers)) {
		    return $publishers;
		}


	$query = <<<EOT
	  SELECT id, name
	  FROM publisher
	  ORDER BY name ASC
EOT;

		$db = ComicDB_DB::db();
		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}

		$publishers = array();
		while ($row = $result->fetch_array()) {
		    $t = new ComicDB_Publisher();
		    $t->id($row[0]);
		    $t->name($row[1]);
		    array_push($publishers, $t);
		}

		return $publishers;
	    }
}

?>

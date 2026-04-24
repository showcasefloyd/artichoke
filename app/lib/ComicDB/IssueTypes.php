<?php

include_once("ComicDB/IssueType.php");

class ComicDB_IssueTypes {
    var $issue_types;

    public function __construct(...$args) {

    	$this->ComicDB_IssueTypes(...$args);

    }


    function ComicDB_IssueTypes() {
    }

    // public methods

    function getAll() {
	if (isset($issue_types)) {
	    return $issue_types;
	}

	$query = "SELECT id, name\n"
		. "  FROM issue_type\n"
		. " ORDER BY name ASC";

	$db = ComicDB_DB::db();
	if(!$result = $db->query($query)){
		die('There was an error running the query [' . $db->error . ']');
	}

	$issue_types = array();
	while ($row = $result->fetch_array()) {
	    $t = new ComicDB_IssueType();
	    $t->id($row[0]);
	    $t->name($row[1]);
	    array_push($issue_types, $t);
	}

	return $issue_types;
    }
}

?>

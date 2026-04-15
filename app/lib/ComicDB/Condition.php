<?php

include_once("ComicDB/DB.php");
include_once("ComicDB/Object.php");

class ComicDB_Condition extends ComicDB_Object {
    var $name;

    public function __construct(...$args) {

    	$this->ComicDB_Condition(...$args);

    }


    function ComicDB_Condition() {
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
		return new PEAR_Error("select not implemented");
    }

    function update() {
		return new PEAR_Error("update not implemented");
    }

    function delete() {
		return new PEAR_Error("delete not implemented");
    }
}

?>

<?php

include_once("ComicDB/Condition.php");

class ComicDB_Conditions {
	var $conditions;

	public function __construct(...$args) {

		$this->ComicDB_Conditions(...$args);

	}


	function ComicDB_Conditions() {
	
	}

	// public methods

	function getConditions() {
		if (isset($conditions)) {
			return $conditions;
		}

		// not stored in the db for compatibility with linux comic db
		$list = array(
			array("id" => "1", "name" => "Mint (M)"),
			array("id" => "2", "name" => "Near Mint (NM)"),
			array("id" => "3", "name" => "Very Fine (VF)"),
			array("id" => "4", "name" => "Fine-Very Fine (FVF)"),
			array("id" => "5", "name" => "Fine (FN)"),
			array("id" => "6", "name" => "Very Good (VG)"),
			array("id" => "7", "name" => "Good (G)"),
			array("id" => "8", "name" => "Fair (FR)"),
			array("id" => "9", "name" => "Poor (P)"),
		);

		$conditions = array();

		foreach ($list as $l) {
			
			$o = new ComicDB_Condition();
			$o->id = $l["id"];
			$o->name = $l["name"];
			
			array_push($conditions, $o);
		}

		return $conditions;


	}
}

?>

<?php

include_once("ComicDB/Issues.php");
include_once("ComicDB/Series.php");

class ComicDB_Serieses {
	var $series;
	var $titleId;

	public function __construct(...$args) {

		$this->ComicDB_Serieses(...$args);

	}


	function ComicDB_Serieses($titleId) {
		$this->titleId = $titleId;
	}

	// public methods

	function getAll() {
		if (isset($series)) {
			return $series;
		}

		$query = <<<EOT
		SELECT id, title, name, publisher, type, default_price, first_issue,
			final_issue, subscribed, comments
		FROM series
		WHERE title=$this->titleId
		ORDER BY name ASC
EOT;

		$db = ComicDB_DB::db();

		$db->query($query);
		if(!$result = $db->query($query)){
		    die('There was an error running the query [' . $db->error . ']');
		}

		//$rows = $db->getAll($query);
		//if (ComicDB_DB::isError($rows)) {
		//	return $rows;
		//}

		$series = array();
		while ($row = $result->fetch_assoc()) {
			$s = new ComicDB_Series();
			$s->id($row['id']);
			$s->titleId($row['title']);
			$s->name($row['name']);
			$s->publisher($row['publisher']);
			$s->type($row['type']);
			$s->defaultPrice($row['default_price']);
			$s->firstIssue($row['first_issue']);
			$s->finalIssue($row['final_issue']);
			$s->subscribed($row['subscribed']);
			$s->comments($row['comments']);

			array_push($series, $s);
		}

		return $series;
	}

	function removeAll() {
		// first remove all issues for each series
		$list = $this->getAll();
		// if (ComicDB_DB::isError($list)) {
		// 	return $list;
		// }

		foreach ($list as $s) {
			$issues = new ComicDB_Issues($s->id());
			$rv = $issues->removeAll();
			// if (ComicDB_DB::isError($rv)) {
			// 	return $rv;
			// }
		}

		// then remove all series
		$query = <<<EOT
DELETE FROM series
	WHERE title=$this->titleId
EOT;

		$db = ComicDB_DB::db();
		return $db->query($query);
	}
}

?>

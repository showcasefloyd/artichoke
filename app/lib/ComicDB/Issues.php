<?php

include_once("ComicDB/Issue.php");

class ComicDB_Issues {
	var $issues;
	var $seriesId;

	public function __construct(...$args) {

		$this->ComicDB_Issues(...$args);

	}


	public function ComicDB_Issues($seriesId) {
		$this->seriesId = $seriesId;
	}

	// public methods

	public function getAll() {
		if (isset($issues)) {
			return $issues;
		}

		$query = <<<EOT
  SELECT id, series, number, sort, printrun, quantity,
		 UNIX_TIMESTAMP(cover_date), location, type, status, bkcondition,
		 cover_price, purchase_price, UNIX_TIMESTAMP(purchase_date),
	 guide_value, guide, issue_value, comments
	FROM issues
   WHERE series=$this->seriesId
ORDER BY number ASC
EOT;
		$db = ComicDB_DB::db();
		if(!$result = $db->query($query)){
			die('There was an error running the query, yo [' . $db->error . ']'.  $query);
		}

		$issues = array();
		while ($row = $result->fetch_assoc()){
			$i = new ComicDB_Issue();
			$i->id($row['id']);
			$i->seriesId($row['series']);
			$i->number($row['number']);
			$i->sort($row['sort']);
			$i->printRun($row['printrun']);
			$i->quantity($row['quantity']);
			if(isset($row['cover_date'])){
				$i->coverDate($row['cover_date']);
			}
			$i->location($row['location']);
			$i->type($row['type']);
			$i->status($row['status']);
			$i->condition($row['bkcondition']);
			$i->coverPrice($row['cover_price']);
			$i->purchasePrice($row['purchase_price']);
			if(isset($row['purchase_date'])){
				$i->purchaseDate($row['purchase_date']);
			}
			$i->guideValue($row['guide_value']);
			$i->guide($row['guide']);
			$i->issueValue($row['issue_value']);
			$i->comments($row['comments']);

			array_push($issues, $i);
		}

		usort($issues, "_inumcmp");

		return $issues;
	}

	public function removeAll() {
		$query = <<<EOT
DELETE FROM issues
	  WHERE series=$this->seriesId
EOT;

		$db = ComicDB_DB::db();
		return $db->query($query);
	}
}

function _inumcmp($a, $b) {
	return strnatcasecmp($a->number(), $b->number());
}

?>

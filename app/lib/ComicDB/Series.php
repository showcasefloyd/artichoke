<?php

include_once("ComicDB/DB.php");
include_once("ComicDB/Object.php");
include_once("ComicDB/Issues.php");
include_once("ComicDB/Title.php");

class ComicDB_Series extends ComicDB_Object {

	public $titleId;
	public $name;
	public $volume;
	public $startYear;
	public $publisher;
	public $type;
	public $defaultPrice;
	public $firstIssue;
	public $finalIssue;
	public $totalIssues;
	public $subscribed;
	public $comments;
	public $title;
	public $issues;

	public function __construct(...$args) {

		$this->ComicDB_Series(...$args);

	}


	public function ComicDB_Series($id=null) {
		$this->ComicDB_Object($id);
	}

	// accessors

	public function titleId($titleId=null) {
		if (isset($titleId)) {
			$this->titleId = $titleId;
			$this->isDirty = 1;
		}
		return $this->titleId;
	}

	public function name($name=null) {
		if (isset($name)) {
			$this->name = $name;
			$this->isDirty = 1;
		}
		return $this->name;
	}

	public function publisher($publisher=null) {
		if (isset($publisher)) {
			$this->publisher = $publisher;
			$this->isDirty = 1;
		}
		return $this->publisher;
	}

	public function volume($volume=null) {
		if (isset($volume)) {
			$this->volume = $volume;
			$this->isDirty = 1;
		}
		return $this->volume;
	}

	public function startYear($startYear=null) {
		if (isset($startYear)) {
			$this->startYear = $startYear;
			$this->isDirty = 1;
		}
		return $this->startYear;
	}

	public function type($type=null) {
		if (isset($type)) {
			$this->type = $type;
			$this->isDirty = 1;
		}
		return $this->type;
	}

	public function defaultPrice($defaultPrice=null) {
		if (isset($defaultPrice)) {
			$this->defaultPrice = $defaultPrice;
			$this->isDirty = 1;
		}
		return $this->defaultPrice;
	}

	public function firstIssue($firstIssue=null) {
		if (isset($firstIssue)) {
			$this->firstIssue = $firstIssue;
			$this->isDirty = 1;
		}
		return $this->firstIssue;
	}

	public function finalIssue($finalIssue=null) {
		if (isset($finalIssue)) {
			$this->finalIssue = $finalIssue;
			$this->isDirty = 1;
		}
		return $this->finalIssue;
	}

	public function subscribed($subscribed=null) {
		if (isset($subscribed)) {
			$this->subscribed = $subscribed;
			$this->isDirty = 1;
		}
		return $this->subscribed;
	}

	public function totalIssues($totalIssues=null) {
		if (isset($totalIssues)) {
			$this->totalIssues = $totalIssues;
			$this->isDirty = 1;
		}
		return $this->totalIssues;
	}

	public function comments($comments=null) {
		if (isset($comments)) {
			$this->comments = $comments;
			$this->isDirty = 1;
		}
		return $this->comments;
	}

	protected function normalizeDecimal($value) {
		if (! isset($value) || $value === '') {
			return null;
		}
		$normalized = str_replace(',', '.', trim((string) $value));
		if (! is_numeric($normalized)) {
			return null;
		}
		return (float) $normalized;
	}

	protected function normalizeSeriesTypeName($type, $db) {
		if (! isset($type)) {
			return null;
		}
		$type = trim((string) $type);
		if ($type === '') {
			return null;
		}
		$typeEscaped = $db->real_escape_string($type);
		$query = "SELECT name\n"
			. "  FROM series_type\n"
			. " WHERE LOWER(name) = LOWER('$typeEscaped')\n"
			. " LIMIT 1";
		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}
		$row = $result->fetch_assoc();
		if ($row && isset($row['name'])) {
			return $row['name'];
		}
		$insert = "INSERT INTO series_type (name)\n"
			. "VALUES ('$typeEscaped')";
		if(!$db->query($insert)){
			die('There was an error running the query [' . $db->error . ']');
		}
		return $type;
	}

	// public methods

	public function hasTotalIssuesColumn() {
		static $checked = false;
		static $hasColumn = false;
		if ($checked) {
			return $hasColumn;
		}
		$db = ComicDB_DB::db();
		$query = "SHOW COLUMNS FROM series LIKE 'total_issues'";
		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}
		$hasColumn = $result->num_rows > 0;
		$checked = true;
		return $hasColumn;
	}

	public function issues() {
		if (! $this->issues) {
			$this->issues = new ComicDB_Issues($this->id());
		}
		return $this->issues->getAll();
	}

	public function title() {
		if ($this->title) {
			return $this->title;
		}

		$title = new ComicDB_Title($this->titleId());
		$rv = $title->restore();
		if (PEAR::isError($rv)) {
			return $rv;
		}

		return $title;
	}

	// interface methods

	protected function select() {
		$db = ComicDB_DB::db();
		$includeTotalIssues = $this->hasTotalIssuesColumn();
		$query = "SELECT id, title, name, volume, start_year, publisher, type,\n";
		if ($includeTotalIssues) {
			$query .= "       default_price, first_issue, final_issue, total_issues, subscribed, comments\n";
		} else {
			$query .= "       default_price, first_issue, final_issue, subscribed, comments\n";
		}
		$query .= ""
			. "  FROM series\n"
			. " WHERE id=$this->id";
		if(!$result = $db->query($query)){
		    die('There was an error running the query [' . $db->error . ']');
		}
		$row = $result->fetch_assoc();

		$this->id($row['id']);
		$this->titleId($row['title']);
		$this->name($row['name']);
		$this->volume($row['volume']);
		$this->startYear($row['start_year']);
		$this->publisher($row['publisher']);
		$this->type($row['type']);
		$this->defaultPrice($row['default_price']);
		$this->firstIssue($row['first_issue']);
		$this->finalIssue($row['final_issue']);
		if ($includeTotalIssues) {
			$this->totalIssues($row['total_issues']);
		} else {
			$this->totalIssues(0);
		}
		$this->subscribed($row['subscribed']);
		$this->comments($row['comments']);

		return;
	}

	protected function insert() {
		$data = array();
		$db = ComicDB_DB::db();

		// mandatory fields
		$data['title'] = $this->titleId();
		$data['name'] = "'" . $this->name() . "'";
		$data['publisher'] = "'" . $this->publisher() . "'";

		// optional fields
		$volume = $this->volume();
		if ($volume != "" && $volume > 0) {
			$data['volume'] = (int) $volume;
		}

		$startYear = $this->startYear();
		if ($startYear != "" && $startYear > 0) {
			$data['start_year'] = (int) $startYear;
		}

		$type = $this->normalizeSeriesTypeName($this->type(), $db);
		if ($type !== null) {
			$typeEscaped = $db->real_escape_string($type);
			$data['type'] = "'$typeEscaped'";
		}

		$defaultPrice = $this->normalizeDecimal($this->defaultPrice());
		if ($defaultPrice !== null && $defaultPrice >= 0) {
			$data['default_price'] = $defaultPrice;
		}

		$firstIssue = $this->firstIssue();
		if ($firstIssue != "" && $firstIssue >= 0) {
			$data['first_issue'] = $firstIssue;
		}

		$finalIssue = $this->finalIssue();
		if ($finalIssue != "" && $finalIssue >= 0) {
			$data['final_issue'] = $finalIssue;
		}
		if ($this->hasTotalIssuesColumn()) {
			$totalIssues = $this->totalIssues();
			if ($totalIssues != "" && $totalIssues >= 0) {
				$data['total_issues'] = (int) $totalIssues;
			} else {
				$data['total_issues'] = 1;
			}
		}

		if ($this->subscribed()) {
			$data['subscribed'] = 1;
		}

		$comments = $this->comments();
		if ($comments) {
			$data['comments'] = "'$comments'";
		}

		// build query
		$query = "INSERT INTO series";

		$keys = array_keys($data);
		$values = array();
		foreach ($keys as $key) {
			array_push($values, $data[$key]);
		}

		$cols = implode(', ', $keys);
		$vals = implode(', ', $values);
		$query .= " ($cols) VALUES ($vals)";

		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}

		// is there a better portable way of retrieving the id?
		$query = "SELECT id\n"
			. "  FROM series\n"
			. " ORDER BY id DESC\n"
			. "  LIMIT 1";
		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}
		$row = $result->fetch_array();
		$this->id($row['id']);

		return;
	}

	protected function update() {
		$data = array();
		$db = ComicDB_DB::db();

		$titleId = $this->titleId();
		if ($titleId) {
			$data['title'] = $titleId;
		} else {
			$data['title'] = "NULL";
		}

		$name = $this->name();
		if ($name) {
			$data['name'] = "'$name'";
		}

		$publisher = $this->publisher();
		if ($publisher) {
			$data['publisher'] = "'$publisher'";
		}

		$volume = $this->volume();
		if ($volume != "" && $volume > 0) {
			$data['volume'] = (int) $volume;
		} else {
			$data['volume'] = "NULL";
		}

		$startYear = $this->startYear();
		if ($startYear != "" && $startYear > 0) {
			$data['start_year'] = (int) $startYear;
		} else {
			$data['start_year'] = "NULL";
		}

		$type = $this->normalizeSeriesTypeName($this->type(), $db);
		if ($type !== null) {
			$typeEscaped = $db->real_escape_string($type);
			$data['type'] = "'$typeEscaped'";
		} else {
			$data['type'] = "NULL";
		}

		$defaultPrice = $this->normalizeDecimal($this->defaultPrice());
		if ($defaultPrice !== null && $defaultPrice >= 0) {
			$data['default_price'] = $defaultPrice;
		} else {
			$data['default_price'] = "NULL";
		}

		$firstIssue = $this->firstIssue();
		if ($firstIssue != "" && $firstIssue >= 0) {
			$data['first_issue'] = $firstIssue;
		} else {
			$data['first_issue'] = "NULL";
		}

		$finalIssue = $this->finalIssue();
		if ($finalIssue != "" && $finalIssue >= 0) {
			$data['final_issue'] = $finalIssue;
		} else {
			$data['final_issue'] = "NULL";
		}

		if ($this->hasTotalIssuesColumn()) {
			$totalIssues = $this->totalIssues();
			if ($totalIssues != "" && $totalIssues >= 0) {
				$data['total_issues'] = (int) $totalIssues;
			} else {
				$data['total_issues'] = 1;
			}
		}

		if ($this->subscribed()) {
			$data['subscribed'] = 1;
		} else {
			$data['subscribed'] = 0;
		}

		$comments = $this->comments();
		if ($comments) {
			$data['comments'] = "'$comments'";
		} else {
			$data['comments'] = "NULL";
		}

		// build query
		$terms = array();
		foreach ($data as $key => $val) {
			array_push($terms, "$key=$val");
		}
		$set = implode(', ', $terms);

		$id = $this->id();
		$query = "UPDATE series\n"
			. "   SET $set\n"
			. " WHERE id=$id";

		return $db->query($query);
	}

	protected function delete() {
		// first remove all issues for this series
		$issues = new ComicDB_Issues($this->id());
		$rv = $issues->removeAll();
		if (PEAR::isError($rv)) {
			return $rv;
		}

		// then remove the series itself
		$id = $this->id();
		$query = "DELETE FROM series\n"
			. " WHERE id=$id";

		$db = ComicDB_DB::db();
		return $db->query($query);
	}
}

?>

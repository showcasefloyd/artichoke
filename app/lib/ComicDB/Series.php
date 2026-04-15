<?php

include_once("ComicDB/DB.php");
include_once("ComicDB/Object.php");
include_once("ComicDB/Issues.php");
include_once("ComicDB/Title.php");

class ComicDB_Series extends ComicDB_Object {

	public $titleId;
	public $name;
	public $publisher;
	public $type;
	public $defaultPrice;
	public $firstIssue;
	public $finalIssue;
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

	public function comments($comments=null) {
		if (isset($comments)) {
			$this->comments = $comments;
			$this->isDirty = 1;
		}
		return $this->comments;
	}

	// public methods

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
		$query = <<<EOT
	    SELECT *
    FROM series
   WHERE id=$this->id
EOT;
		$db = ComicDB_DB::db();
		if(!$result = $db->query($query)){
		    die('There was an error running the query [' . $db->error . ']');
		}
		$row = $result->fetch_array();

		$this->id($row[0]);
		$this->titleId($row[1]);
		$this->name($row[2]);
		$this->publisher($row[3]);
		$this->type($row[4]);
		$this->defaultPrice($row[5]);
		$this->firstIssue($row[6]);
		$this->finalIssue($row[7]);
		$this->subscribed($row[8]);
		$this->comments($row[9]);

		return;
	}

	protected function insert() {
		$data = array();

		// mandatory fields
		$data['title'] = $this->titleId();
		$data['name'] = "'" . $this->name() . "'";
		$data['publisher'] = "'" . $this->publisher() . "'";

		// optional fields
		$type = $this->type();
		if ($this->type) {
			$data['type'] = "'$type'";
		}

		$defaultPrice = $this->defaultPrice();
		if ($this->defaultPrice() && $defaultPrice >= 0) {
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

		$db = ComicDB_DB::db();
		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}

		// is there a better portable way of retrieving the id?
		$query = <<<EOT
  SELECT id
    FROM series
ORDER BY id DESC
   LIMIT 1
EOT;
		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}
		$row = $result->fetch_array();
		$this->id($row['id']);

		return;
	}

	protected function update() {
		$data = array();

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

		$type = $this->type();
		if ($type) {
			$data['type'] = "'$type'";
		} else {
			$data['type'] = "NULL";
		}

		$defaultPrice = $this->defaultPrice();
		if ($defaultPrice != "" && $defaultPrice >= 0) {
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
		$query = <<<EOT
UPDATE series
   SET $set
 WHERE id=$id
EOT;

		$db = ComicDB_DB::db();
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
		$query = <<<EOT
DELETE FROM series
	WHERE id=$id
EOT;

		$db = ComicDB_DB::db();
		return $db->query($query);
	}
}

?>

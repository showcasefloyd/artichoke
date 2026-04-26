<?php

include_once("ComicDB/DB.php");
include_once("ComicDB/Object.php");
include_once("ComicDB/Series.php");

class ComicDB_Issue extends ComicDB_Object {
	var $seriesId;
	var $number;
	var $sort;
	var $printRun;
	var $quantity;
	var $coverDate;
	var $location;
	var $type;
	var $status;
	var $condition;
	var $coverPrice;
	var $purchasePrice;
	var $purchaseDate;
	var $guideValue;
	var $guide;
	var $issueValue;
	var $comments;
	var $storyTitle;
	var $series;
	var $id;

	public function __construct(...$args) {

		$this->ComicDB_Issue(...$args);

	}


	function ComicDB_Issue($id=null) {
		$this->ComicDB_Object($id);
	}

	// accessors

	function seriesId($seriesId=null) {
		if (isset($seriesId)) {
			$this->seriesId = $seriesId;
			$this->isDirty = 1;
		}
		return $this->seriesId;
	}

	function number($number=null) {
		if (isset($number)) {
			$this->number = $number;
			$this->isDirty = 1;
		}
		return $this->number;
	}

	function sort($sort=null) {
		if (isset($sort)) {
			$this->sort = $sort;
			$this->isDirty = 1;
		}
		return $this->sort;
	}

	function printRun($printRun=null) {
		if (isset($printRun)) {
			$this->printRun = $printRun;
			$this->isDirty = 1;
		}
		return $this->printRun;
	}

	function quantity($quantity=null) {
		if (isset($quantity)) {
			$this->quantity = $quantity;
			$this->isDirty = 1;
		}
		return $this->quantity;
	}

	function coverDate($coverDate=null) {
		if (isset($coverDate)) {
			$this->coverDate = $coverDate;
			$this->isDirty = 1;
		}
		return $this->coverDate;
	}

	function location($location=null) {
		if (isset($location)) {
			$this->location = $location;
			$this->isDirty = 1;
		}
		return $this->location;
	}

	function type($type=null) {
		if (isset($type)) {
			$this->type = $type;
			$this->isDirty = 1;
		}
		return $this->type;
	}

	function status($status=null) {
		if (isset($status)) {
			$this->status = $status;
			$this->isDirty = 1;
		}
		return $this->status;
	}

	function condition($condition = null) {
		if (isset($condition)) {
			//DEBUG PBI
			//print $condition;
			$this->condition = $condition;
			$this->isDirty = 1;
		}
		return $this->condition;
	}

	function coverPrice($coverPrice=null) {
		if (isset($coverPrice)) {
			$this->coverPrice = $coverPrice;
			$this->isDirty = 1;
		}
		return $this->coverPrice;
	}

	function purchasePrice($purchasePrice=null) {
		if (isset($purchasePrice)) {
			$this->purchasePrice = $purchasePrice;
			$this->isDirty = 1;
		}
		return $this->purchasePrice;
	}

	function purchaseDate($purchaseDate=null) {
		if (isset($purchaseDate)) {
			$this->purchaseDate = $purchaseDate;
			$this->isDirty = 1;
		}
		return $this->purchaseDate;
	}

	function guideValue($guideValue=null) {
		if (isset($guideValue)) {
			$this->guideValue = $guideValue;
			$this->isDirty = 1;
		}
		return $this->guideValue;
	}

	function guide($guide=null) {
		if (isset($guide)) {
			$this->guide = $guide;
			$this->isDirty = 1;
		}
		return $this->guide;
	}

	function issueValue($issueValue=null) {
		if (isset($issueValue)) {
			$this->issueValue = $issueValue;
			$this->isDirty = 1;
		}
		return $this->issueValue;
	}

	function comments($comments=null) {
		if (isset($comments)) {
			$this->comments = $comments;
			$this->isDirty = 1;
		}
		return $this->comments;
	}

	function storyTitle($storyTitle=null) {
		if (isset($storyTitle)) {
			$this->storyTitle = $storyTitle;
			$this->isDirty = 1;
		}
		return $this->storyTitle;
	}

	// public methods

	function hasStoryTitleColumn() {
		static $checked = false;
		static $hasColumn = false;
		if ($checked) {
			return $hasColumn;
		}
		$db = ComicDB_DB::db();
		$query = "SHOW COLUMNS FROM issues LIKE 'story_title'";
		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}
		$hasColumn = $result->num_rows > 0;
		$checked = true;
		return $hasColumn;
	}

	function series() {
		if ($this->series) {
			return $this->series;
		}
		$series = new ComicDB_Series($this->seriesId());
		$rv = $series->restore();
		if (PEAR::isError($rv)) {
			return $rv;
		}

		return $series;
	}

	// interface methods

	function select() {
		$id = $this->id();

		$includeStoryTitle = $this->hasStoryTitleColumn();
		$query = "SELECT id, series, number, sort, printrun, quantity,\n"
			. "       UNIX_TIMESTAMP(cover_date), location, type, status, bkcondition,\n"
			. "       cover_price, purchase_price, UNIX_TIMESTAMP(purchase_date),\n";
		if ($includeStoryTitle) {
			$query .= "       guide_value, guide, issue_value, comments, story_title\n";
		} else {
			$query .= "       guide_value, guide, issue_value, comments\n";
		}
		$query .= ""
			. "  FROM issues\n"
			. " WHERE id=$id";

		$db = ComicDB_DB::db();

		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']'. $query);
		}

		$row = $result->fetch_array();

		$this->id($row[0]);
		$this->seriesId($row[1]);
		$this->number($row[2]);
		$this->sort($row[3]);
		$this->printRun($row[4]);
		$this->quantity($row[5]);
		$this->coverDate($row[6]);
		$this->location($row[7]);
		$this->type($row[8]);
		$this->status($row[9]);
		$this->condition($row[10]);
		$this->coverPrice($row[11]);
		$this->purchasePrice($row[12]);
		$this->purchaseDate($row[13]);
		$this->guideValue($row[14]);
		$this->guide($row[15]);
		$this->issueValue($row[16]);
		$this->comments($row[17]);
		if ($includeStoryTitle) {
			$this->storyTitle($row[18]);
		} else {
			$this->storyTitle(null);
		}

		return;
	}

	function insert() {
		$data = array();

		// mandatory fields
		$data['series'] = $this->seriesId();
		$data['number'] = "'" . $this->number() . "'";

		// optional fields
		$sort = $this->sort();
		if ($sort != "" && $sort >= 0) {
			$data['sort'] = $sort;
		}

		$printRun = $this->printRun();
		if ($printRun) {
			$data['printrun'] = "'$printRun'";
		}

		$quantity = $this->quantity();
		if ($quantity != "" && $quantity >= 0) {
			$data['quantity'] = $quantity;
		}

		$coverDate = $this->coverDate();
		if ($coverDate) {
			$coverDate = date("Ymd", $coverDate);
			$data['cover_date'] = "'$coverDate'";
		}

		$location = $this->location();
		if ($location) {
			$data['location'] = "'$location'";
		}

		$type = $this->type();
		if ($type) {
			$data['type'] = "'$type'";
		}

		$status = $this->status();
		if ($status != "" && $status >= 0) {
			$data['status'] = $status;
		}

		$condition = $this->condition();
		if ($condition) {
			$data['bkcondition'] = "'$condition'";
		}

		$coverPrice = $this->coverPrice();
		if ($coverPrice && $coverPrice >= 0) {
			$data['cover_price'] = $coverPrice;
		}

		$purchasePrice = $this->purchasePrice();
		if ($purchasePrice && $purchasePrice >= 0) {
			$data['purchase_price'] = $purchasePrice;
		}

		$purchaseDate = $this->purchaseDate();
		$purchaseDate = date("Ymd", $purchaseDate);
		if ($purchaseDate) {
			$data['purchase_date'] = "'$purchaseDate'";
		}

		$guideValue = $this->guideValue();
		if ($guideValue && $guideValue >= 0) {
			$data['guide_value'] = $guideValue;
		}

		$guide = $this->guide();
		if ($guide) {
			$data['guide'] = "'$guide'";
		}

		$issueValue = $this->issueValue();
		if ($issueValue && $issueValue >= 0) {
			$data['issue_value'] = $issueValue;
		}

		$comments = $this->comments();
		if ($comments) {
			$data['comments'] = "'$comments'";
		}

		$storyTitle = $this->storyTitle();
		if ($storyTitle && $this->hasStoryTitleColumn()) {
			$data['story_title'] = "'$storyTitle'";
		}

		// build query
		$query = "INSERT INTO issues";

		$keys = array_keys($data);
		$values = array();
		foreach ($keys as $key) {
			array_push($values, $data[$key]);
		}

		$cols = implode(', ', $keys);
		$vals = implode(', ', $values);
		$query .= " ($cols) VALUES ($vals)";

		$db = ComicDB_DB::db();
		$rv = $db->query($query);
		if (PEAR::isError($rv)) {
			return $rv;
		}

		// is there a better portable way of retrieving the id?
		$query = "SELECT id\n"
			. "  FROM issues\n"
			. " ORDER BY id DESC\n"
			. "  LIMIT 1";
		//$id = $db->getOne($query);
		//$id = $db->insert_id;
		if(!$result = $db->query($query)){
			die('There was an error running the query [' . $db->error . ']');
		}
		$row = $result->fetch_array();
		$this->id($row['id']);

		return DB_OK;
	}

	function update() {
		$data = array();

		$seriesId = $this->seriesId();
		if ($seriesId) {
			$data['series'] = $seriesId;
		}

		$number = $this->number();
		if ($number) {
			$data['number'] = "'$number'";
		} else {
			$data['number'] = "NULL";
		}

		$sort = $this->sort();
		if ($sort != "" && $sort >= 0) {
			$data['sort'] = $sort;
		} else {
			$data['sort'] = "NULL";
		}

		$printRun = $this->printRun();
		if ($printRun) {
			$data['printrun'] = "'$printRun'";
		} else {
			$data['printrun'] = "NULL";
		}

		$quantity = $this->quantity();
		if ($quantity != "" && $quantity >= 0) {
			$data['quantity'] = $quantity;
		} else {
			$data['quantity'] = "NULL";
		}

		$coverDate = $this->coverDate();
		if ($coverDate) {
			$coverDate = date("Ymd", $coverDate);
			$data['cover_date'] = "'$coverDate'";
		} else {
			$data['cover_date'] = "NULL";
		}

		$location = $this->location();
		if ($location) {
			$data['location'] = "'$location'";
		} else {
			$data['location'] = "NULL";
		}

		$type = $this->type();
		if ($type) {
			$data['type'] = "'$type'";
		} else {
			$data['type'] = "NULL";
		}

		$status = $this->status();
		if ($status != "" && $status >= 0) {
			$data['status'] = $status;
		} else {
			$data['status'] = "NULL";
		}

		$condition = $this->condition();
		if ($condition) {
			$data['bkcondition'] = "'$condition'";
		} else {
			$data['bkcondition'] = "NULL";
		}

		$coverPrice = $this->coverPrice();
		if ($coverPrice && $coverPrice >= 0) {
			$data['cover_price'] = $coverPrice;
		} else {
			$data['cover_price'] = "NULL";
		}

		$purchasePrice = $this->purchasePrice();
		if ($purchasePrice && $purchasePrice >= 0) {
			$data['purchase_price'] = $purchasePrice;
		} else {
			$data['purchase_price'] = "NULL";
		}

		$purchaseDate = $this->purchaseDate();
		if ($purchaseDate) {
			$purchaseDate = date("Ymd", $purchaseDate);
			$data['purchase_date'] = "'$purchaseDate'";
		} else {
			$data['purchase_date'] = "NULL";
		}

		$guideValue = $this->guideValue();
		if ($guideValue && $guideValue >= 0) {
			$data['guide_value'] = $guideValue;
		} else {
			$data['guide_value'] = "NULL";
		}

		$guide = $this->guide();
		if ($guide) {
			$data['guide'] = "'$guide'";
		} else {
			$data['guide'] = "NULL";
		}

		$issueValue = $this->issueValue();
		if ($issueValue && $issueValue >= 0) {
			$data['issue_value'] = $issueValue;
		} else {
			$data['issue_value'] = "NULL";
		}

		$comments = $this->comments();
		if ($comments) {
			$data['comments'] = "'$comments'";
		} else {
			$data['comments'] = "NULL";
		}

		$storyTitle = $this->storyTitle();
		if ($this->hasStoryTitleColumn()) {
			if ($storyTitle) {
				$data['story_title'] = "'$storyTitle'";
			} else {
				$data['story_title'] = "NULL";
			}
		}

		// build query
		$terms = array();
		foreach ($data as $key => $val) {
			array_push($terms, "$key=$val");
		}
		$set = implode(', ', $terms);

		$id = $this->id();
		$query = "UPDATE issues\n"
			. "   SET $set\n"
			. " WHERE id=$id";

		$db = ComicDB_DB::db();
		return $db->query($query);
	}

	function delete() {
		$id = $this->id();

		$query = "DELETE FROM issues\n"
			. " WHERE id=$id";

		$db = ComicDB_DB::db();
		return $db->query($query);
	}
}

?>

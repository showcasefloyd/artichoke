<?php
include_once("ComicDB/Series.php");
include_once("ComicDB/Issue.php");

class Grid {

	private $grid;
	private $series;
	private $seriesId;
	private $issuesInColl = array();
	private $issuesinSeries = array();
	private $firstIssue;
	private $lastIssue;
	private $totalIssues;

	function __construct($series = null){
		//$this->seriesId = $seriesId;
		//$this->series = new ComicDB_Series($this->seriesId);
		//$this->series->restore();
		$this->series = $series;
		$this->firstIssue = $this->series->firstIssue();
		$this->lastIssue = $this->series->finalIssue();
		$this->totalIssues = $this->series->totalIssues();
	}

	// Public Methods
	/** returns an object with grid in it **/
	public function displayGrid()
	{
		$i = $this->series->issues();
		//echo $this->displayGridHeader();
		return $this->calculateSeriesRun($i);
	}

	/** Checks to see if the issue is in the read state or not read state **/
	public function hasReadIssue()
	{

	}

	// Private Methods

	//No longer used.
	private function formatGrid($issuesForSeries)
	{
		$countRows = 1;
		$rowAcross = 10;
		foreach($issuesForSeries as $k => $i){

			//echo "Series Id ". $v->seriesId." | Number ". $v->number ." | Printing ". $v->printRun ."";
			//echo "> Number ". $v->number ;

			if($countRows > $rowAcross){
				$countRows = 1;
				echo "<hr class='clear-row'>";
			}
			//echo $i['issue'];

			if($i['own'] == "Y"){
				echo "<div class='issue-box own' ><a href='./issue.php?iid=". $i['issue_id']. " '  target='issue'> ". $i['issue'] ."</a></div>";
			} else  {
				echo "<div class='issue-box'>". $i['issue']  ."</div>";
			}

			$countRows++;
		}
	}

	/* Builds an object that takes the issue in my collection and compares
	   the issues matching any I have */
	private function calculateSeriesRun($issues)
	{
		$totalIssues = $this->parseTotalIssues($this->totalIssues);
		if ($totalIssues !== null && $totalIssues > 1) {
			$collection = array();
			for($i = 1; $i <= $totalIssues; $i++){
				$book = array();
				$book['issue'] = $i;
				$book['own'] = "N";
				$book['issue_id'] = 0;
				$collection[] = $book;
			}

			// each book we have
			foreach($issues as $k => $v){
				$slot = $this->parseIssueSort($v->sort);
				if ($slot === null) {
					$slot = $this->parseIssueNumber($v->number);
				}
				if ($slot === null || $slot < 1 || $slot > $totalIssues) {
					continue;
				}
				$key = $slot - 1;
				if ($collection[$key]['own'] === "N") {
					$collection[$key]['own'] = "Y";
					$collection[$key]['issue_id'] =  (int) $v->id;
				}
			}

			return $collection;
		}

		$firstIssue = $this->parseIssueNumber($this->firstIssue);
		$lastIssue = $this->parseIssueNumber($this->lastIssue);
		if ($firstIssue === null || $lastIssue === null || $lastIssue <= $firstIssue) {
			return array();
		}
		$totalIssues = $lastIssue - $firstIssue + 1;

		$collection = array();
		$issueIndex = array();
		for($i = 1; $i <= $totalIssues; $i++){
			$book = array();
			$book['issue'] = $firstIssue + $i - 1;
			$book['own'] = "N";
			$book['issue_id'] = 0;
			$collection[] = $book;
			$issueIndex[$firstIssue + $i - 1] = count($collection) - 1;
		}

		// each book we have
		foreach($issues as $k => $v){
			$issueNumber = $this->parseIssueNumber($v->number);
			if ($issueNumber === null || !isset($issueIndex[$issueNumber])) {
				continue;
			}
			$key = $issueIndex[$issueNumber];
			if ($collection[$key]['own'] === "N") {
				$collection[$key]['own'] = "Y";
				$collection[$key]['issue_id'] =  (int) $v->id;
			}
		}

		return $collection;
	}

	private function parseIssueSort($value)
	{
		if (!isset($value)) {
			return null;
		}
		$normalized = trim((string) $value);
		if ($normalized === '' || !preg_match('/^-?\d+$/', $normalized)) {
			return null;
		}
		$position = (int) $normalized;
		if ($position < 1) {
			return null;
		}
		return $position;
	}

	private function parseIssueNumber($value)
	{
		if (!isset($value)) {
			return null;
		}
		$normalized = trim((string) $value);
		if ($normalized === '' || !ctype_digit($normalized)) {
			return null;
		}
		$issueNumber = (int) $normalized;
		if ($issueNumber < 0) {
			return null;
		}
		return $issueNumber;
	}

	private function parseTotalIssues($value)
	{
		if (!isset($value)) {
			return null;
		}
		$normalized = trim((string) $value);
		if ($normalized === '' || !preg_match('/^\d+$/', $normalized)) {
			return null;
		}
		return (int) $normalized;
	}

	//	private function displayGridHeader()
	//	{
	//		$h = "<h4>".$this->series->name() ." (" . $this->series->publisher() .") </h4>";
	//
	//		return $h;
	//	}

	// interface methods
	protected function updateIssue()
	{

	}

}
?>

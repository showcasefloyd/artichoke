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

	function __construct($series = null){
		//$this->seriesId = $seriesId;
		//$this->series = new ComicDB_Series($this->seriesId);
		//$this->series->restore();
		$this->series = $series;
		$this->firstIssue = $this->series->firstIssue();
		$this->lastIssue = $this->series->finalIssue();
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
		$collection = array();
		for($i = $this->firstIssue; $i <= $this->lastIssue; $i++){
			$book = array();
			$book['issue'] = $i;
			$book['own'] = "N";
			$collection[] = $book;
		}

		// each book we have
		foreach($issues as $k => $v){
			// Search array for the value
			foreach($collection as  $key  => $book){
				if($book['issue'] == $v->number){
					// Update the specific array
					$collection[$key]['own'] = "Y";
					$collection[$key]['issue_id'] =  $v->id;
					break;
				}
			}
		}

		return $collection;
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

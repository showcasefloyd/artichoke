<?php
require_once('./lib/global.inc');
include_once("ComicDB/Titles.php");
include_once("ComicDB/Title.php");
include_once("ComicDB/Serieses.php");
//include_once("ComicDB/Issue.php");

$data = array();
$titlesArray = array();
$titlesList = new ComicDB_Titles();
$titles = $titlesList->getAll();

// Grab Titles
foreach ($titles as $t){
  array_push($titlesArray, array('id' =>$t->id, 'name'=> $t->name));
  //$titlesArray['titles'][] = array('id' =>$t->id, 'name'=> $t->name);
}
//array_push($data,$titlesArray);
$data['titles'] = $titlesArray;
echo json_encode($data);

// Grab a Title
function grabTitle ($id){

   $title = new ComicDB_Title($id);
   $titleArray = $title->select();

   return json_encode($titleArray);
}


// Grab Series
function grabSeries ($id){
   $seriesArray = array();
   $seriesList = new ComicDB_Serieses($id);
   $series = $seriesList->getAll();

   if(count($series) > 0){
      foreach ($series as $s ) {
         array_push($seriesArray,array('id'=> $s->id, 'title' => $s->name));
      }
   } else {
      array_push($seriesArray,array('id'=> 0, 'title' => "No series"));
   }

   $data['series_id'] = $id;
   $data['series'] = $seriesArray;
   return json_encode($data);
}

function grabSerie(){}

function grabIssues($id){
   //$issuesArray = array();
   $series = new ComicDB_Series($id);
   $series->restore();

   //New test of Grid of comic DB Grid
   $grid = new Grid($series);
   $gridData = $grid->displayGrid();

   // Return title object
   $title = $series->title();
   $issues = $series->issues();

   return json_encode($gridData);
}


function grabIssue($id){
   $issueArray = array();
   $issue = new ComicDB_Issue($id);
   $issue->restore();

   $issueArray['number'] = htmlspecialchars($issue->number());
   $issueArray['printrun'] = htmlspecialchars($issue->printRun());
   $issueArray['quanity'] = $issue->quantity();
   $issueArray['location'] = htmlspecialchars($issue->location());
   $issueArray['type'] = htmlspecialchars($issue->type());
   $issueArray['condition'] = htmlspecialchars($issue->condition());
   $issueArray['coverprice'] = $issue->coverPrice();
   $issueArray['purchaseprice'] = $issue->purchasePrice();
   $issueArray['priceguidevalue'] = $issue->guideValue();
   $issueArray['issuevalue'] = $issue->issueValue();
   $issueArray['priceguide'] = htmlspecialchars($issue->guide());
   $issueArray['comments'] = htmlspecialchars($issue->comments());
   //$issueArray['image'] = "";

   $status = $issue->status();
   if ($status == 0) {
      $status = "Collected";
   } else if ($status == 1) {
      $status = "For Sale";
   } else if ($status == 2) {
      $status = "Wish List";
   } else {
      $status = "Unknown";
   }
   $issueArray['status'] = $status;
   $issueArray['purchasedate'] = strftime("%b %d, %Y", $issue->purchasedate());
   $issueArray['coverdate'] = strftime("%b %Y", $issue->coverdate());

   return json_encode($issueArray);
}

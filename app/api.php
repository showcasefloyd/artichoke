<?php
require_once('./lib/global.inc');
include_once("ComicDB/Titles.php");
include_once("ComicDB/Title.php");
include_once("ComicDB/Serieses.php");
include_once("ComicDB/Issue.php");

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

function grabSerieById($id) {
   $series = new ComicDB_Series($id);
   $series->restore();
   return json_encode(array(
      'id'           => $series->id(),
      'titleId'      => $series->titleId(),
      'name'         => $series->name(),
      'publisher'    => $series->publisher(),
      'type'         => $series->type(),
      'defaultPrice' => $series->defaultPrice(),
      'firstIssue'   => $series->firstIssue(),
      'finalIssue'   => $series->finalIssue(),
      'subscribed'   => $series->subscribed(),
      'comments'     => $series->comments(),
   ));
}

// Create a Title
function createTitle($name) {
   $title = new ComicDB_Title();
   $title->name($name);
   $title->save();
   return json_encode(array('id' => $title->id(), 'name' => $title->name()));
}

// Update a Title
function updateTitle($id, $name) {
   $title = new ComicDB_Title($id);
   $title->restore();
   $title->name($name);
   $title->save();
   return json_encode(array('id' => $title->id(), 'name' => $title->name()));
}

// Delete a Title
function deleteTitle($id) {
   $title = new ComicDB_Title($id);
   $title->restore();
   $title->remove();
   return json_encode(array('deleted' => true, 'id' => (int)$id));
}

// Create a Series
function createSeries($dataJson) {
   $data = json_decode($dataJson, true);
   $series = new ComicDB_Series();
   $series->titleId($data['titleId']);
   $series->name($data['name']);
   $series->publisher($data['publisher']);
   if (isset($data['type']))         $series->type($data['type']);
   if (isset($data['defaultPrice'])) $series->defaultPrice($data['defaultPrice']);
   if (isset($data['firstIssue']))   $series->firstIssue($data['firstIssue']);
   if (isset($data['finalIssue']))   $series->finalIssue($data['finalIssue']);
   if (isset($data['subscribed']))   $series->subscribed($data['subscribed']);
   if (isset($data['comments']))     $series->comments($data['comments']);
   $series->save();
   return json_encode(array('id' => $series->id(), 'name' => $series->name()));
}

// Update a Series
function updateSeries($id, $dataJson) {
   $data = json_decode($dataJson, true);
   $series = new ComicDB_Series($id);
   $series->restore();
   if (isset($data['titleId']))      $series->titleId($data['titleId']);
   if (isset($data['name']))         $series->name($data['name']);
   if (isset($data['publisher']))    $series->publisher($data['publisher']);
   if (isset($data['type']))         $series->type($data['type']);
   if (isset($data['defaultPrice'])) $series->defaultPrice($data['defaultPrice']);
   if (isset($data['firstIssue']))   $series->firstIssue($data['firstIssue']);
   if (isset($data['finalIssue']))   $series->finalIssue($data['finalIssue']);
   if (isset($data['subscribed']))   $series->subscribed($data['subscribed']);
   if (isset($data['comments']))     $series->comments($data['comments']);
   $series->save();
   return json_encode(array('id' => $series->id(), 'name' => $series->name()));
}

// Delete a Series
function deleteSeries($id) {
   $series = new ComicDB_Series($id);
   $series->restore();
   $series->remove();
   return json_encode(array('deleted' => true, 'id' => (int)$id));
}

// Create an Issue
function createIssue($dataJson) {
   $data = json_decode($dataJson, true);
   $issue = new ComicDB_Issue();
   $issue->seriesId($data['seriesId']);
   $issue->number($data['number']);
   if (isset($data['sort']))          $issue->sort($data['sort']);
   if (isset($data['printRun']))      $issue->printRun($data['printRun']);
   if (isset($data['quantity']))      $issue->quantity($data['quantity']);
   if (isset($data['coverDate']))     $issue->coverDate($data['coverDate']);
   if (isset($data['location']))      $issue->location($data['location']);
   if (isset($data['type']))          $issue->type($data['type']);
   if (isset($data['status']))        $issue->status($data['status']);
   if (isset($data['condition']))     $issue->condition($data['condition']);
   if (isset($data['coverPrice']))    $issue->coverPrice($data['coverPrice']);
   if (isset($data['purchasePrice'])) $issue->purchasePrice($data['purchasePrice']);
   if (isset($data['purchaseDate']))  $issue->purchaseDate($data['purchaseDate']);
   if (isset($data['guideValue']))    $issue->guideValue($data['guideValue']);
   if (isset($data['guide']))         $issue->guide($data['guide']);
   if (isset($data['issueValue']))    $issue->issueValue($data['issueValue']);
   if (isset($data['comments']))      $issue->comments($data['comments']);
   $issue->save();
   return json_encode(array('id' => $issue->id(), 'number' => $issue->number()));
}

// Update an Issue
function updateIssue($id, $dataJson) {
   $data = json_decode($dataJson, true);
   $issue = new ComicDB_Issue($id);
   $issue->restore();
   if (isset($data['seriesId']))      $issue->seriesId($data['seriesId']);
   if (isset($data['number']))        $issue->number($data['number']);
   if (isset($data['sort']))          $issue->sort($data['sort']);
   if (isset($data['printRun']))      $issue->printRun($data['printRun']);
   if (isset($data['quantity']))      $issue->quantity($data['quantity']);
   if (isset($data['coverDate']))     $issue->coverDate($data['coverDate']);
   if (isset($data['location']))      $issue->location($data['location']);
   if (isset($data['type']))          $issue->type($data['type']);
   if (isset($data['status']))        $issue->status($data['status']);
   if (isset($data['condition']))     $issue->condition($data['condition']);
   if (isset($data['coverPrice']))    $issue->coverPrice($data['coverPrice']);
   if (isset($data['purchasePrice'])) $issue->purchasePrice($data['purchasePrice']);
   if (isset($data['purchaseDate']))  $issue->purchaseDate($data['purchaseDate']);
   if (isset($data['guideValue']))    $issue->guideValue($data['guideValue']);
   if (isset($data['guide']))         $issue->guide($data['guide']);
   if (isset($data['issueValue']))    $issue->issueValue($data['issueValue']);
   if (isset($data['comments']))      $issue->comments($data['comments']);
   $issue->save();
   return json_encode(array('id' => $issue->id(), 'number' => $issue->number()));
}

// Delete an Issue
function deleteIssue($id) {
   $issue = new ComicDB_Issue($id);
   $issue->restore();
   $issue->remove();
   return json_encode(array('deleted' => true, 'id' => (int)$id));
}

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
   $issueArray['purchasedate'] = date("M d, Y", $issue->purchasedate());
   $issueArray['coverdate'] = date("M Y", $issue->coverdate());

   return json_encode($issueArray);
}

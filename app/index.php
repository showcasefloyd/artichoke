<?php
    require_once './lib/global.inc';
    include_once "ComicDB/Serieses.php";
    include_once "ComicDB/Titles.php";
    include_once "ComicDB/Issue.php";

    $titlesList = new ComicDB_Titles();
    $titles     = $titlesList->getAll();

    if (PEAR::isError($titles)) {
    die("Unable to get list of titles: " . $titles->message . " [" . $titles->debuginfo . "]");
    }

    if (isset($_GET['xid'])) {
    $seriesList = new ComicDB_Serieses($_GET['xid']);
    $series     = $seriesList->getAll();

    if (PEAR::isError($series)) {
        die("can't get list of series: " . $series->message . " [" . $series->debuginfo . "]");
    }
    }
    $page_title = ComicDB_pageTitle("titles");
?>


<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
   <title><?php echo $page_title; ?></title>
   <meta name="description" content="">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<link rel="stylesheet" href="/css/main.css" media="screen">
</head>
<body>


<div class="container">
   <div class="row">
      <div class="col-sm-3" id="left-menu">

         <table class="table-striped table-bordered title-table">
         <tr>
      	   <td colspan="2" class="title-table-header">Titles</td>
         </tr>
         <?php
             if (count($titles) == 0) {
                 echo '<tr><td colspan="2"><em>No titles in the catalog!</em></tr>';
             } else {

                 foreach ($titles as $t) {
                     $title_name = htmlspecialchars($t->name());
                     $title_id   = $t->id();

                     if (isset($xid) && $xid == $title_id) {
                         // Click open title
                         echo '<tr>
                        <td class="title-icon-open"><span class="glyphicon glyphicon-chevron-down"></span></td>
                        <td class="title-name-open">' . $title_name . '</td>
                    </tr>';
                     } else {
                         // Closed Title
                         echo '<tr>
         			      <td class="title-icon-closed"><a href="./index.php?xid=' . $title_id . '"><span class="glyphicon glyphicon-chevron-right"></span></a></td>
         				   <td class="title-name-closed">' . $title_name . '</td>
         			</tr>';
                     }

                     if (isset($xid) && $xid == $title_id) {
                         if (count($series) == 0) {
                             // No Series
                             echo '
                        <tr>
         				      <td>&nbsp;</td>
                           <td class="title-series"><em>No series for title!<em></td>
                        </tr>
                     ';
                         } else {
                             // List each series for a title
                             foreach ($series as $s) {
                                 $series_name = htmlspecialchars($s->name());
                                 $series_id   = $s->id();
                                 echo '<tr>
         					   <td>&nbsp;</td>
         					   <td class="title-series"><a href="./index.php?tid=' . $title_id . '&sid=' . $series_id . '"> -- ' . $series_name . '</a></td>
         					</tr>';
                             }
                         }
                     }
                 }
             }
         ?>
         </table>
      </div>

      <div class="col-sm-9" id="main-top">
         <?php
             isset($sid) || die("No series specified");

             $series = new ComicDB_Series($sid);
             $series->restore();
             //$rv = $series->restore();
             // if (PEAR::isError($rv)) {
             //     die("<p>can't get series [id $sid]: " . $rv->message . " [" . $rv->debuginfo . "]</p>");
             // }

             //New test of Grid of comic DB Grid
             $grid     = new Grid($series);
             $gridData = $grid->displayGrid();

             // Return Title object
             $title = $series->title();
             // if (PEAR::isError($title)) {
             //     die("<p>can't get title for series [id $sid]: " . $rv->message . " [" . $rv->debuginfo . "]</p>");
             // }
             // Return Isses in this Series object
             $issues = $series->issues();
             // if (PEAR::isError($issues)) {
             //     die("<p>can't get issues for series [id $sid]: " . $rv->message . " [" . $rv->debuginfo . "]</p>");
             // }

         ?>
         <span class="series-title"><?php echo htmlspecialchars($title->name()); ?></span><br>
         <span class="series-series"><?php echo htmlspecialchars($series->name()); ?></span><br><br>
         	<div id="comicgrid" class="clearfix">

         		<?php
                     foreach ($gridData as $key => $i) {
                         if ($i['own'] == "Y") {
                             echo "<div class='issue-box own'><a href='./index.php?iid=" . $i['issue_id'] . "&tid=" . $tid . "&sid=" . $sid . "'> " . $i['issue'] . "</a></div>";
                         } else {
                             echo "<div class='issue-box'>" . $i['issue'] . "</div>";
                         }
                     }
                 ?>
         	</div>

      </div>

      <div class="col-sm-offset-3 col-sm-9" id="main-bottom">
         <?php
             isset($iid) || die("No issue specified");

             $issue = new ComicDB_Issue($iid);
             $issue->restore();

             // $rv = $issue->restore();
             // if (PEAR::isError($rv)) {
             //     die("can't get issue [id $iid]: ". $rv->message ." [". $rv->debuginfo ."]");
             // }

             $series = $issue->series();
             // if (PEAR::isError($series)) {
             //     die("can't get series for issue [id $iid]: ". $rv->message ." [". $rv->debuginfo ."]");
             // }

             $title = $series->title();
             // if (PEAR::isError($title)) {
             //     $sid = $series->id();
             //     die("can't get title for series [id $sid]: ". $rv->message ." [". $rv->debuginfo ."]");
             // }

             //$page_title = ComicDB_pageTitle($title->name(), $series->name(),$issue->number());

             $number          = htmlspecialchars($issue->number());
             $printrun        = htmlspecialchars($issue->printRun());
             $quantity        = $issue->quantity();
             $location        = htmlspecialchars($issue->location());
             $type            = htmlspecialchars($issue->type());
             $condition       = htmlspecialchars($issue->condition());
             $coverprice      = $issue->coverPrice();
             $purchaseprice   = $issue->purchasePrice();
             $priceguidevalue = $issue->guideValue();
             $issuevalue      = $issue->issueValue();
             $priceguide      = htmlspecialchars($issue->guide());
             $comments        = htmlspecialchars($issue->comments());

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

             $purchasedate = $issue->purchaseDate();
             if ($purchasedate) {
                 $purchasedate = htmlspecialchars(strftime("%b %d, %Y", $purchasedate));
             }
             $coverdate = $issue->coverDate();
             if ($coverdate) {
                 $coverdate = htmlspecialchars(strftime("%b %Y", $coverdate));
             }

         ?>

            <table class="table-striped table-bordered issue-table">
               <tr>
                  <td class="issue-key">Issue Number:</td>
                  <td class="issue-val"><?php echo $number; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Print Run:</td>
                  <td class="issue-val"><?php echo $printrun; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Cover Date:</td>
                  <td class="issue-val"><?php echo $coverdate; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Issue Type:</td>
                  <td class="issue-val"><?php echo $type; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Location:</td>
                  <td class="issue-val"><?php echo $location; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Quantity:</td>
                  <td class="issue-val"><?php echo $quantity; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Status:</td>
                  <td class="issue-val"><?php echo $status; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Condition:</td>
                  <td class="issue-val"><?php echo $condition; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Cover Price:</td>
                  <td class="issue-val"><?php echo $coverprice; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Purchase Price:</td>
                  <td class="issue-val"><?php echo $purchaseprice; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Price Guide Value:</td>
                  <td class="issue-val"><?php echo $priceguidevalue; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Issue Value:</td>
                  <td class="issue-val"><?php echo $issuevalue; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Purchase Date: </td>
                  <td class="issue-val"><?php echo $purchasedate; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Price Guide:</td>
                  <td class="issue-val"><?php echo $priceguide; ?></td>
               </tr>
               <tr>
                  <td class="issue-key">Comments:</td>
                  <td class="issue-val"><?php echo $comments; ?></td>
               </tr>
            </table>
         </div>
   </div>
</div>

   <script src="/js/app.js"></script>

</body>
</html>

<?php
include_once("ComicDB/Conditions.php");
include_once("ComicDB/Guides.php");
include_once("ComicDB/IssueTypes.php");
include_once("ComicDB/Locations.php");
include_once("ComicDB/PrintRuns.php");
include_once("ComicDB/Series.php");
include_once("ComicDB/Title.php");

$title = new ComicDB_Title($title_id);
$rv = $title->restore();
if (PEAR::isError($rv)) {
    die("can't get title [id $title_id]: " . $rv->message . " [" .
	  $rv->debuginfo . "]");
}

$series = new ComicDB_Series($series_id);
$rv = $series->restore();
if (PEAR::isError($rv)) {
    die("can't get series [id $series_id]: " . $rv->message . " [" .
	  $rv->debuginfo . "]");
}

$print_runs_list = new ComicDB_PrintRuns();
$print_runs = $print_runs_list->getAll();
if (PEAR::isError($print_runs)) {
    die("can't get list of print runs: " . $print_runs->message);
}

$locations_list = new ComicDB_Locations();
$locations = $locations_list->getAll();
if (PEAR::isError($locations)) {
    die("can't get list of locations: " . $locations->message);
}

$issue_types_list = new ComicDB_IssueTypes();
$issue_types = $issue_types_list->getAll();
if (PEAR::isError($issue_types)) {
    die("can't get list of issue types: " . $issue_types->message);
}

$conditions_list = new ComicDB_Conditions();
$conditions = $conditions_list->getConditions();
if (PEAR::isError($conditions)) {
    die("can't get list of conditions: " . $conditions->message);
}

$guides_list = new ComicDB_Guides();
$guides = $guides_list->getAll();
if (PEAR::isError($guides)) {
    die("can't get list of guides: " . $guides->message);
}

// if we are displaying the form for the first time, set default form
// field values
if (! $save_new_issue) {
    // XXX: look up the last issue in this series and provide
    // incremented number and cover date
    $number = "";
    $printrun = "1st Printing";
    $quantity = 1;
    $status = 0;
    $condition = "Near Mint (NM)";

    // cover price defaults to the series' default price
    $cover_price = $series->defaultPrice();
    if (! isset($cover_price)) {
	  $cover_price = "-1.00";
    }

    $purchase_price = $cover_price;
    $guide_value = $cover_price;
    $issue_value = $cover_price;

    $purchase_date = strftime("%b %d, %Y");
}

?>

<form class="well form-horizontal" method="post" action="actions.php">

	<div class="form-group">
		<div class="col-sm-12">
		<p class="lead text-primary">
			Title: <?php echo htmlspecialchars($title->name()); ?> <br>
			Series: <?php echo htmlspecialchars($series->name()	)?> <br>

			<input type="hidden" name="series_id" value="<?php echo $series->id ?>">
			<input type="hidden" name="title_id" value="<?php echo $title->id ?>">
		</p>
		</div>
	</div>


    <div class="form-group">
	  <label class="col-sm-2 control-label">Issue Number:</label>
		<div class="col-sm-8">
		  <input type="text" name="number" value="<?php echo $number?>" size="40" maxlength="80">
		</div>
    </div>


    <div class="form-group">
	  <label class="col-sm-2 control-label">Print Run:</label>
		<div class="col-sm-6">
	    <select class="form-control" name="printrun">
		<option value=""> --choose-- </option>
		<?php
		foreach ($print_runs as $p) {
		    $name = htmlspecialchars($p->name());
		    if ($printrun == $p->name()) {
			  echo '<option selected>'. $name .'</option>';
		    } else {
			  echo '<option>'. $name .'</option>';

		    }
		}
		?>
	  </select>
		</div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Quantity:</label>
	  <div class="col-sm-8">
		  <input type="text" name="quantity" value="<?php echo $quantity?>" size="5" maxlength="11">
	  </div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Cover Date:</label>
	  <div class="col-sm-8">
		  <input type="text" name="cover_date" value="<?php echo $cover_date?>" size="13" maxlength="80">
	  </div>
    </div>

    <div class="radio-inline">
		<label class="radio-inline">
		<?php if ($status == 0) { ?>
			<input type="radio" name="status" value="0" checked>
		<?php } else { ?>
			<input type="radio" name="status" value="0">
		<?php } ?>
		Collected:
		</label>

		 <label class="radio-inline">
		<?php if ($status == 1) { ?>
			<input type="radio" name="status" value="1" checked>
		<?php } else { ?>
			<input type="radio" name="status" value="1">
		<?php } ?>
		For Sale:
		</label>
		 <label class="radio-inline">
		<?php if ($status == 2) { ?>
			<input type="radio" name="status" value="2" checked>
		<?php } else { ?>
			<input type="radio" name="status" value="2">
		 <?php } ?>
		 Wish List
		</label>
    </div>
    <p>&nbsp;</p>

<!--
    <div class="form-group">
	  <label class="col-sm-2 control-label">Location:</label>
		<div class="col-sm-6">
		    <select class="form-control" name="location">
			<option value="">--choose--</option>
			<?php
			foreach ($locations as $l) {
			    $name = htmlspecialchars($l->name());
			    if ($location == $l->name()) {
				  echo '<option selected>'. $name .'</option>';
			    } else {
				  echo '<option>'. $name .'</option>';
			    }
			}
			?>
		  </select>
		</div>
    </div>
-->

<!--
    <div class="form-group">
	  <label class="col-sm-2 control-label">Issue Type:</label>
	  <div class="col-sm-6">
		    <select class="form-control" name="type">
			<option value="">--choose--</option>
			<?php
			foreach ($issue_types as $t) {
			    $name = htmlspecialchars($t->name());
			    if ($type == $t->name()) {
				  echo '<option selected>'. $name .'</option>';
			    } else {
				  echo '<option>'. $name .'</option>';
			    }
			}
			?>
		  </select>
	  </div>
    </div>
-->

    <div class="form-group">
	  <label class="col-sm-2 control-label">Condition:</label>
	  <div class="col-sm-6">
		    <select class="form-control" name="bkcondition">
			<option value="">--choose--</option>
			<?php
			foreach ($conditions as $c) {
			    $name = htmlspecialchars($c->name());
			    if ($bkcondition == $c->name()) {
				  echo '<option selected>'. $name .'</option>';
			    } else {
				  echo '<option>'. $name .'</option>';

			    }
			}
			?>
		  </select>
	  </div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Cover Price:</label>
	  <div class="col-sm-8">
		  <input type="text" name="cover_price" value="<?php echo $cover_price?>" size="12" maxlength="12">
	  </div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Purchase Price:</label>
	  <div class="col-sm-8">
		  <input type="text" name="purchase_price" value="<?php echo $purchase_price?>" size="12" maxlength="12">
	  </div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Purchase Date:</label>
	  <div class="col-sm-8">
		  <input type="text" name="purchase_date" value="<?php echo $purchase_date?>" size="12" maxlength="12">
	  </div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Price Guide Value:</label>
	  <div class="col-sm-8">
		  <input type="text" name="guide_value" value="<?php echo $guide_value?>" size="12" maxlength="12">
	  </div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Price Guide:</label>
	  <div class="col-sm-6">
		    <select class="form-control" name="guide">
			<option value=""> --choose-- </option>
			<?php
			foreach ($guides as $g) {
			    $name = htmlspecialchars($g->name());
			    if ($guide == $g->name()) {
				  echo '<option selected>'. $name .'</option>';
			    } else {
				  echo '<option>'. $name .'</option>';
			    }
			}
			?>
		  </select>
	  </div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Value of Issue:</label>
		<div class="col-sm-8">
		  <input type="text" name="issue_value" value="<?php echo  $issue_value?>" size="12" maxlength="12">
		</div>
    </div>

    <div class="form-group">
	  <label class="col-sm-2 control-label">Comments:</label>
	  <div class="col-sm-8">
		  <textarea name="comments" rows="4" cols="60"><?php echo $comments; ?></textarea>
	  </div>
    </div>

    <div class="form-group">
	  <div class="col-sm-4">
		<input type="submit" class="btn btn-default" name="save_new_issue" value="Save">
	  </div>
    </div>

</form>

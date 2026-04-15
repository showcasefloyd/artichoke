<?php
include_once("ComicDB/Publishers.php");
include_once("ComicDB/Series.php");
include_once("ComicDB/SeriesTypes.php");
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

$publishers_list = new ComicDB_Publishers();
$publishers = $publishers_list->getAll();
if (PEAR::isError($publishers)) {
    die("can't get list of publishers: " . $publishers->message);
}

$series_types_list = new ComicDB_SeriesTypes();
$series_types = $series_types_list->getAll();
if (PEAR::isError($series_types)) {
    die("can't get list of series types: " . $series_types->message);
}

if (! isset($save_series) ||
    (isset($save_series) && isset($success_msg))) {
    $series_name = htmlspecialchars($series->name());
    $default_price = $series->defaultPrice();
    $first_issue = $series->firstIssue();
    $last_issue = $series->finalIssue();
    $subscribed = $series->subscribed();
    $comments = htmlspecialchars($series->comments());
}
?>


<form class="well form-horizontal" method="post" action="actions.php">

	<div class="form-group">
		<div class="col-sm-12">
			<p class="lead text-primary">Title: <?php echo htmlspecialchars($title->name()); ?> </p>
			<input type="hidden" name="title_id" value="<?php echo $title->id()?>">
			<input type="hidden" name="series_id" value="<?php echo $series->id()?>">
		</div>
	</div>


	<div class="form-group">
		<label class="col-sm-2 control-label" for="inputSeries" ><span class="mandatory-field-marker">*</span> Series</label>
		<!-- <span class="mandatory-field-marker">*</span> Series: -->
		<div class="col-sm-8">
			<input type="text" id="inputSeries" name="series_name" value="<?php echo  $series_name?>" size="40" maxlength="80">
		</div>
	</div>


	<div class="form-group">
		<label class="col-sm-2 control-label"><span class="mandatory-field-marker">*</span> Publisher</label>
		<!-- <span class="mandatory-field-marker">*</span> Publisher: -->
		<div class="col-sm-6">

			<select class="form-control" name="publisher">
				<option value=""> --choose-- </option>
				<?php
				foreach ($publishers as $p) {
				  $name = htmlspecialchars($p->name());
				  if ($series->publisher() == $p->name()) {
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
		<label class="col-sm-2 control-label"> Type:</label>
		<div class="col-sm-6">

		<select class="form-control" name="series_type">
		<option value=""> --choose-- </option>
		<?php
		foreach ($series_types as $s) {
		  $name = htmlspecialchars($s->name());
		  if ($series->type() == $s->name()) {
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
		<label class="col-sm-2 control-label"> Default Price: </label>
		<div class="col-sm-6">
		<input type="text" name="default_price" placeholder="$3.99" value="<?php echo  $default_price?>" size="12" maxlength="12">
	</div>
	</div>

	<div class="form-group">
		<label class="col-sm-2 control-label"> Issues: </label>
		<div class="col-sm-10">
		<input type="text" name="first_issue" placeholder="First Issue" value="<?php echo $first_issue?>"> <input type="text" placeholder="Last Issue" name="last_issue" value="<?php echo  $last_issue?>" >
	</div>
	</div>

	<div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
	<div class="checkbox">
	  <label>
	    <input type="checkbox" name="subscribed" <?php echo  $subscribed ? "checked" : ""?>> Subscribed?
	  </label>
	</div>
    </div>
    </div>

	<div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">

	 <label>Comments: </label><br>
	 <textarea name="comments" rows="4" cols="60"><?php echo  $comments?></textarea></p>

    </div>
    </div>


	<input type="submit" class="btn btn-default" name="save_series" value="Save">
	<input type="submit" class="btn btn-default" name="remove_series" value="Remove">

</form>

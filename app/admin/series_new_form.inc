<?php
include_once("ComicDB/Publishers.php");
include_once("ComicDB/SeriesTypes.php");
include_once("ComicDB/Title.php");

$title = new ComicDB_Title($title_id);
$rv = $title->restore();
if (PEAR::isError($rv)) {
    die("can't get title [id $title_id]: " . $rv->message . " [" .
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

// if we are displaying the form for the first time, set default form
// field values
if (! $save_new_series) {
    $first_issue = 1;
    $last_issue = 0;
}
?>

<form class="well form-horizontal" method="post" action="actions.php">

	<div class="form-group">
		<div class="col-sm-12">
			<p class="lead text-primary">Title: <?php echo htmlspecialchars($title->name()); ?> </p>
			<input type="hidden" name="title_id" value="<?php echo $title->id ?>">

		</div>
	</div>

	<div class="form-group">
		<label class="col-sm-2 control-label" for="inputTitle" > Series: </label>
		<div class="col-sm-8">
		<input type="text" name="series_name" value="<?php echo  $series_name?>" size="40" maxlength="80">
	</div>
	</div>

	<div class="form-group">
		<label class="col-sm-2 control-label" for="inputTitle" ><span class="mandatory-field-marker">*</span> Publisher</label>
		<!-- <span class="mandatory-field-marker">*</span> Publisher: -->
		<div class="col-sm-6">

			<select class="form-control" name="publisher">
				<option value=""> --choose-- </option>
				<?php
				foreach ($publishers as $p) {
				  $name = htmlspecialchars($p->name());
				  if ($series->publisher == $p->name()) {
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
		<label class="col-sm-2 control-label" for="inputTitle" > Type:</label>
		<div class="col-sm-6">

		<select class="form-control" name="series_type">
		<option value=""> --choose-- </option>
		<?php
		foreach ($series_types as $s) {
		  $name = htmlspecialchars($s->name());
		  if ($series->type == $s->name()) {
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
		<label class="col-sm-2 control-label" for="inputTitle" > Default Price: </label>
		<div class="col-sm-6">
		<input type="text" name="default_price" placeholder="$3.99" value="<?php echo  $default_price?>" size="12" maxlength="12">
	</div>
	</div>

	<div class="form-group">
		<label class="col-sm-2 control-label" for="inputTitle" > Issues: </label>
		<div class="col-sm-10">
		<input type="text"  placeholder="First Issue"  name="first_issue" value="">
		<input type="text" placeholder="Last Issue" name="last_issue" value="" >
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

	<input type="submit" class="btn btn-default" name="save_new_series" value="Save">



</form>

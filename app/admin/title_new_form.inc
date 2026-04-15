<?php
include_once("ComicDB/Publishers.php");
include_once("ComicDB/SeriesTypes.php");

$publishers_list = new ComicDB_Publishers();
$publishers = $publishers_list->getAll();
if (PEAR::isError($publishers)) {
	die("can't get list of publishers: " . $publishers->message . " [" .$publishers->debuginfo . "]");
}

$series_types_list = new ComicDB_SeriesTypes();
$series_types = $series_types_list->getAll();
if (PEAR::isError($series_types)) {
	die("can't get list of series types: " . $series_types->message . " [" .$series_types->debuginfo . "]");
}

// if we are displaying the form for the first time, set default form field values
if (! $save_new_title) {
	$first_issue = 1;
	$last_issue = 0;
}
?>

<form class="form-horizontal well" method="post" action="actions.php">

	<div class="form-group">
		<div class="col-md-12">
			<p class="lead text-primary">New Title </p>
		</div>
	</div>
    <div class="form-group">
        <label class="control-label col-sm-2" for="inputTitle">
        	<span class="mandatory-field-marker">*</span> Comic Title:
        </label>
        <div class="col-sm-10">
        	<input type="text" id="inputTitle" name="title_name" value="<?php echo $title_name ;?>">
        </div>
    </div>

    <div class="form-group">
        <label class="control-label col-sm-2" for="inputSeries">
        	<span class="mandatory-field-marker">*</span> Series:
        </label>
        <div class="col-sm-10">
        	<input type="text" id="inputSeries" name="series_name" value="<?php echo $series_name; ?>">
        </div>
    </div>

    <div class="form-group">
        <label class="control-label col-sm-2">
        	<span class="mandatory-field-marker" for="inputPublisher">*</span> Publisher:
        </label>
		<div class="col-sm-7">
	        <select class="form-control" name="publisher" id="inputPublisher">
				<option value=""> --choose-- </option>
				<?php
				foreach ($publishers as $p) {
					if ($publisher == $p->name) {
						echo '<option selected>'. $p->name .'</option>';
					} else {
						echo '<option>'. $p->name .'</option>';
					}
				}
				?>
	        </select>
	    </div>
    </div>

    <div class="form-group">
        <label class="control-label col-sm-2">Type:</label>
        <div class="col-sm-7">
	        <select class="form-control" name="series_type">
				<option value=""> --choose-- </option>
				<?php
				foreach ($series_types as $s) {
					if ($series_type == $s->name) {
						echo '<option selected>'. $s->name .'</option>';
					} else {
						echo '<option>'. $s->name .'</option>';
					}
				}
				?>
	        </select>
 		</div>
    </div>

    <div class="form-group">
        <label class="control-label col-sm-2">Default Price:</label>
       <div class="col-sm-7">
       		<input type="text" name="default_price" value="<?php echo  $default_price; ?>"  maxlength="12">
       	</div>
    </div>

	<div class="form-group">
	    <label class="control-label col-sm-2">Issues:</label>
	    <div class="col-sm-7">
	    	<input type="text" name="first_issue" placeholder="First"  maxlength="11">
	    	<input type="text" name="last_issue" placeholder="Last" maxlength="11" >
	   	</div>
	</div>

    <div class="form-group">
       <label class="control-label col-sm-2">Subscribed?</label>
       <div class="col-sm-7">
       		<div class="checkbox">
		       <label>
		       		<input type="checkbox" name="subscribed" <?php echo $subscribed ? "checked" : ""; ?>>
		       </label>
		    </div>
       	</div>
    </div>



    <div class="form-group">
        <label class="control-label col-sm-2">Comments:</label>
        <div class="col-sm-7">
        	<textarea name="comments" rows="6" cols="80"><?php echo $comments ;?></textarea>
        </div>
    </div>

	 <div class="form-group ">
	 	<div class="col-sm-4">
		 	<input type="submit" name="save_new_title"  class="btn btn-default " value="Save">
		</div>
	 </div>

</form>

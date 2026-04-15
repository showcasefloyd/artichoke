<?php
include_once("ComicDB/Title.php");

$title = new ComicDB_Title($title_id);
$rv = $title->restore();
if (PEAR::isError($rv)) {
    die("can't get title [id $title_id]: " . $rv->message . " [" . $rv->debuginfo . "]");
}

if (! isset($save_title)) {
  $title_name = htmlspecialchars($title->name());
}
?>

<form class="form-horizontal well"  method="post" action="actions.php">
	<div class="form-group">
		<div class="col-md-12">
			<p class="lead text-primary">Title: <?php echo htmlspecialchars($title->name()); ?> / <?php echo $title->id(); ?> </p>
		</div>
	</div>
	<div class="form-group">
		 <label class="col-md-2 control-label" for="inputTitle" ><span class="mandatory-field-marker">*</span> Name</label>
		<div class="col-sm-6">
			<input type="text" class="form-control" name="title_name" for="inputTitle" value="<?php echo $title_name ;?>" maxlength="80">
			<span class="help-block">Title of the book</span>
		</div>
	</div>

	 <div class="form-group">
		 <div class="col-sm-4">
			 <input type="hidden" name="title_id" value="<?php echo $title->id(); ?>">
			 <input class="btn btn-default" type="submit" name="save_title" value="Save">
			 <input class="btn btn-default" type="submit" name="remove_title" value="Remove">
		 </div>
	 </div>

</form>

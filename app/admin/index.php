<?php
    require_once '../lib/global.inc';
    include_once "ComicDB/Titles.php";
    include_once "ComicDB/Serieses.php";
    include_once "ComicDB/Issues.php";
    include_once "ComicDB/Util.php";

    // if a "new" button was clicked, unset any menu selections that may
    // have inadvertently been made
    if (isset($new_title)) {
    unset($title_id);
    unset($series_id);
    }
    if (isset($new_series)) {
    unset($series_id);
    }
    if (isset($new_issue)) {
    unset($issue_id);
    }

    // if a "choose" button was clicked, unset any lower level menu selections
    if (isset($choose_title)) {
    unset($series_id);
    unset($issue_id);
    } else if (isset($choose_series)) {
    unset($issue_id);
    }

    if (! isset($title_id)) {
    $title_id = "";
    }
    if (! isset($series_id)) {
    $series_ids = "";
    }
    if (! isset($issue_id)) {
    $issue_id = "";
    }

    // Get titles (page starts here)
    $titles_list = new ComicDB_Titles();
    $titles      = $titles_list->getAll();
    $title_menu  = ComicDB_Util::makeDropDown($titles, $title_id);
    if (PEAR::isError($titles)) {
    die("can't get list of titles: " . $titles->message . " [" . $titles->debuginfo . "]");
    }

    // Grab series (if there is a title id grab the series)
    if (isset($title_id) && $title_id != "") {
    $series_list = new ComicDB_Serieses($title_id);
    $series      = $series_list->getAll();
    $series_menu = ComicDB_Util::makeDropDown($series, $series_id);
    if (PEAR::isError($series)) {
        die("can't get list of series [title id $title_id]: " . $series->message . " [" . $series->debuginfo . "]");
    }
    }

    // Grab Issues for series (if there is a series id get the issues)
    if (isset($series_id) && $series_id != "") {
    $issues_list = new ComicDB_Issues($series_id);
    $issues      = $issues_list->getAll();
    $issues_menu = ComicDB_Util::makeDropDown($issues, $issue_id, 1);
    if (PEAR::isError($issues)) {
        die("can't get list of issues [series id $series_id]: " . $issues->message . " [" . $issues->debuginfo . "]");
    }
    }

    $page_title = ComicDB_pageTitle("admin");

?>
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="utf-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
   <title><?php echo $page_title; ?></title>
   <meta name="description" content="">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">

	<link rel="stylesheet" href="../css/main.css" media="screen">
</head>
<body>

	<div class="admin-container">
			<div class="col-md-12">
				<div class="page-header">
					<h1><?php echo $page_title; ?><br /><small>showcasefloyd, 2015</small></h1>
				</div>

				<?php
                    if (isset($error_msg)) {
                        $error_msg = htmlspecialchars($error_msg);
                        echo '<p><span class="error-message">' . $error_msg . '</span></p>';
                    }
                    if (isset($success_msg)) {
                        $success_msg = htmlspecialchars($success_msg);
                        echo '<p><span class="success-message">' . $success_msg . '</span></p>';
                    }
                ?>

				<form method="get" action="index.php" class="form-horizontal">
					<?php // title chooser widget
                        if (isset($titles)) {
                        ?>
						<div class="form-group">
							<label class="col-md-2 control-label"> Title </label>
							<div class="col-md-6">
								<select name="title_id" class="form-control">
									<?php print $title_menu; ?>
								</select>
							</div>
							<div class="col-md-4">
								<input class="btn btn-primary" type="submit" name="choose_title" value="Choose Title">
									<?php
                                        if (! isset($show_title_new_form)) {
                                                echo ' <input class="btn btn-warning" type="submit" name="new_title" value="New Title"> ';
                                            }
                                        ?>
							</div>
						</div>
					<?php }?>
					<?php // series chooser widget
                        if (isset($series)) {
                        ?>
						<div class="form-group">
							<label class="col-md-2 control-label"> Series </label>
							<div class="col-md-6">
							  <select name="series_id" class="form-control">
								<?php print $series_menu; ?>
							  </select>
							</div>
							<div class="col-md-4">
								<input class="btn btn-primary" type="submit" name="choose_series" value="Choose Series">
									<?php
                                        if ($title_id && ! isset($show_series_new_form)) {
                                                echo ' <input class="btn btn-warning" type="submit" name="new_series" value="New Series"> ';
                                            }
                                        ?>
							</div>
						</div>
					<?php }?>
					<?php // issues chooser widget
                        if (isset($issues)) {
                        ?>
						<div class="form-group">
							<label class="col-md-2 control-label"> Issue </label>
							<div class="col-md-6">
							  <select name="issue_id" class="form-control">
								<?php print $issues_menu; ?>
							  </select>
							</div>
							<div class="col-md-4">
								<input class="btn btn-primary" type="submit" name="choose_issue" value="Choose Issue">
								<?php
                                    if ($series_id && ! isset($show_issue_new_form)) {
                                            echo '<input class="btn btn-warning" type="submit" name="new_issue" value="New Issue">';
                                        }
                                    ?>
							</div>
						</div>
					<?php }?>
				</form>
				<hr>
				<?php
                    // figure out which "new" buttons and which form to show
                    if (isset($new_title) || (isset($save_new_title) && isset($error_msg))) {
                        $show_title_new_form = 1;
                    } else if ((isset($choose_title) && $title_id) || isset($save_title) || isset($save_new_title) || (isset($choose_series) && empty($series_id))) {
                        $show_title_form = 1;
                    } else if (isset($new_series) || (isset($save_new_series) && isset($error_msg))) {
                        $show_series_new_form = 1;
                    } else if (isset($choose_series) || isset($save_series) || isset($save_new_series) || (isset($choose_issue) && empty($issue_id))) {
                        $show_series_form = 1;
                    } else if (isset($new_issue) || (isset($save_new_issue) && isset($error_msg))) {
                        $show_issue_new_form = 1;
                    } else if (isset($choose_issue) || isset($save_issue) || isset($save_new_issue)) {
                        $show_issue_form = 1;
                    }

                    if ($show_title_new_form) {
                        include "title_new_form.inc";
                    } else if ($show_title_form) {
                        include "title_form.inc";
                    } else if ($show_series_new_form) {
                        include "series_new_form.inc";
                    } else if ($show_series_form) {
                        include "series_form.inc";
                    } else if ($show_issue_new_form) {
                        include "issue_new_form.inc";
                    } else if ($show_issue_form) {
                        include "issue_form.inc";
                    }
                ?>
			</div>
	</div>


   <script src="../js/main.js"></script>
</body>
</html>

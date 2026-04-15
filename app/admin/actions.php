<?php
// -*- Mode: PHP; indent-tabs-mode: nil; -*-
require_once('../lib/global.inc');
include_once("ComicDB/Issue.php");
include_once("ComicDB/Series.php");
include_once("ComicDB/Title.php");
include_once("ComicDB/Util.php");

if (isset($save_new_title))
{
	if ($title_name && $series_name && $publisher) {
		$title = new ComicDB_Title();
		$title->name($title_name);

		$rv = $title->save();
		if (! PEAR::isError($rv)) {
			$series = new ComicDB_Series();
			$series->titleId($title->id());
			$series->name($series_name);
			$series->publisher($publisher);
			$series->type($series_type);
			$series->defaultPrice($default_price);
			$series->firstIssue($first_issue);
			$series->finalIssue($last_issue);
			$series->subscribed($subscribed);
			$series->comments($comments);

			$rv = $series->save();
			if (! PEAR::isError($rv)) {
				$success_msg = "Added title '$title_name ($series_name)'.";
				$title_id = $title->id();
				$series_id = $series->id();
			} else {
				// XXX: how to handle the situation when the title is
				// inserted but the series is not?
				$error_msg = "Can't add series: $rv->message [$rv->debuginfo]";
			}
		} else {
			$error_msg = "Can't add title: $rv->message [$rv->debuginfo]";
		}
	} else {
		$error_msg = "All mandatory fields must be filled in.";
	}
}
else if (isset($save_title))
{
		if ($title_name) {
			$title = new ComicDB_Title($title_id);
			$title->name($title_name);

			$rv = $title->save();
			if (! PEAR::isError($rv)) {
				$success_msg = "Updated title '$title_name'.";
			} else {
				$error_msg = "Can't update title: $rv->message [$rv->debuginfo]";
			}
		} else {
			$error_msg = "All mandatory fields must be filled in.";
		}
}
else if (isset($remove_title))
{
		$title = new ComicDB_Title($title_id);

		$rv = $title->remove();
		if (! PEAR::isError($rv)) {
			$success_msg = "Removed title.";
		} else {
			$error_msg = "Can't remove title: $rv->message [$rv->debuginfo]";
		}
}
else if (isset($save_new_series))
{
		if ($title_id && $series_name && $publisher) {
			$series = new ComicDB_Series();
			$series->titleId($title_id);
			$series->name($series_name);
			$series->publisher($publisher);
			$series->type($series_type);
			$series->defaultPrice($default_price);
			$series->firstIssue($first_issue);
			$series->finalIssue($last_issue);
			$series->subscribed($subscribed);
			$series->comments($comments);

			$rv = $series->save();
			if (! PEAR::isError($rv)) {
				$success_msg = "Added series '$series_name'.";
				$series_id = $series->id();
			} else {
				$error_msg = "Can't add series: $rv->message [$rv->debuginfo]";
			}
		} else {
			$error_msg = "All mandatory fields must be filled in.";
		}
}
else if (isset($save_series))
{
		if ($series_id && $title_id && $series_name && $publisher) {
			$series = new ComicDB_Series($series_id);
			$series->titleId($title_id);
			$series->name($series_name);
			$series->publisher($publisher);
			$series->type($series_type);
			$series->defaultPrice($default_price);
			$series->firstIssue($first_issue);
			$series->finalIssue($last_issue);
			$series->subscribed($subscribed);
			$series->comments($comments);

			$rv = $series->save();
			if (! PEAR::isError($rv)) {
				$success_msg = "Updated series '$series_name'.";
			} else {
				$error_msg = "Can't update series: $rv->message [$rv->debuginfo]";
			}
		} else {
			$error_msg = "All mandatory fields must be filled in.";
		}
}
else if (isset($remove_series))
{
		$series = new ComicDB_Series($series_id);

		$rv = $series->remove();
		if (! PEAR::isError($rv)) {
			$success_msg = "Removed series.";
		} else {
			$error_msg = "Can't remove series: $rv->message [$rv->debuginfo]";
		}
}
else if (isset($save_new_issue))
{
		if ($series_id && $number) {
			$issue = new ComicDB_Issue();
			$issue->seriesId($series_id);
			$issue->number($number);
			$issue->printRun($printrun);
			$issue->quantity($quantity);
			$issue->coverDate(ComicDB_Util::parseDate($cover_date));
			$issue->location($location);
			$issue->type($type);
			$issue->status($status);
			$issue->condition($bkcondition);
			$issue->coverPrice($cover_price);
			$issue->purchasePrice($purchase_price);
			$issue->purchaseDate(ComicDB_Util::parseDate($purchase_date));
			$issue->guideValue($guide_value);
			$issue->guide($guide);
			$issue->issueValue($issue_value);
			$issue->comments($comments);

			$rv = $issue->save();
			if (! PEAR::isError($rv)) {
				$success_msg = "Added issue '$number'.";
				$issue_id = $issue->id();
			} else {
				$error_msg = "Can't add issue: $rv->message [$rv->debuginfo]";
			}
		} else {
			$error_msg = "All mandatory fields must be filled in.";
		}
}
else if (isset($save_issue))
{

		if ($issue_id && $series_id && $number) {

			$issue = new ComicDB_Issue($issue_id);

			$issue->number($number);
			$issue->printRun($printrun);
			$issue->coverDate(ComicDB_Util::parseDate($cover_date));
			$issue->quantity($quantity);
			$issue->location($location);
			$issue->type($type);
			$issue->status($status);
			$issue->condition($bkcondition);
			$issue->coverPrice($cover_price);
			$issue->purchasePrice($purchase_price);
			$issue->purchaseDate(ComicDB_Util::parseDate($purchase_date));
			$issue->guideValue($guide_value);
			$issue->guide($guide);
			$issue->issueValue($issue_value);
			$issue->comments($comments);

			$rv = $issue->save();
			if (! PEAR::isError($rv)) {
				$success_msg = "Updated issue '$number'.";
			} else {
				$error_msg = "Can't update issue: $rv->message [$rv->debuginfo]";
			}
		} else {
			$error_msg = "All mandatory fields must be filled in.";
		}
}
else if (isset($remove_issue)) {
		$issue = new ComicDB_Issue($issue_id);

		$rv = $issue->remove();

//		if (! PEAR::isError($rv)) {
//			$success_msg = "Removed issue.";
//		} else {
//			$error_msg = "Can't remove issue: $rv->message [$rv->debuginfo]";
//		}
}

include("./index.php");
?>

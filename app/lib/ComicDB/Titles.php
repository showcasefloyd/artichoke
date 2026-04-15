<?php
include_once("ComicDB/Title.php");

class ComicDB_Titles {
    //A class for all Titles

    private $titles;

    public function __construct(...$args) {

    	$this->ComicDB_Titles(...$args);

    }


    function ComicDB_Titles() {

    }

    // public methods

    function getAll() {

      if (isset($this->titles)) {
		   return $this->titles;
		}

      $query ="SELECT id, name FROM titles ORDER BY name ASC";

		$db = ComicDB_DB::db();
		$db->query($query);

		if(!$result = $db->query($query)){
		   die('There was an error running the query [' . $db->error . ']');
		}
		$this->titles = array();

		while ($row = $result->fetch_assoc()) {
         $t = new ComicDB_Title();
         $t->id($row['id']);
         $t->name($row['name']);
         array_push($this->titles, $t);
		}

		// Free result set
		mysqli_free_result($result);

		return $this->titles;
    }
}

?>

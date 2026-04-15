<?php

class ComicDB_Util {

   // Parse Data Function
   public static function parseDate($date=null){
      if (! isset($date) || $date == "") {
         return null;
      }
      // Oct 2001
      if (preg_match("/^[a-zA-Z0-9]+ +[a-zA-Z0-9]+$/", $date)) {
         $date = "1 $date";
      }
      return strtotime($date);
   }

    // Takes the contents of the list return from the DB and makes a pretty HTML dropdown list
   public static function makeDropDown($list, $selected, $number = 0)
    {
	    $dd = "";
	    $dd .= '<option value=" "> --choose--</option>';
	    foreach ($list as $item) {

		if($number == 0){
			$name = htmlspecialchars($item->name());
		} else {
			$name = htmlspecialchars($item->number());
		}

		$id = $item->id();

		if ($selected == $id) {
		    $dd .= '<option value="'.$id.'" selected>'. $name .'</option>';
		} else {
		    $dd .= '<option value="'.$id.'">'. $name .'</option>';
		}
	  }

	  return $dd;
    }


}

?>

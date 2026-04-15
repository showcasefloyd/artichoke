<?php
/* Database connection class */
//include_once("DB.php");

class ComicDB_DB {
   // static methods
   public static function dsn($dsn=null) {
      if (isset($dsn)) {
         $GLOBALS["ComicDB_dsn"] = $dsn;
      }
      return $GLOBALS["ComicDB_dsn"];
   }

   // Database Connection Method
   public static function db() {
      if (! isset($GLOBALS["ComicDB_db"])) {
         //$db = DB::connect(ComicDB_DB::dsn());
         //if (DB::isError($db)) {
            //die ($db->getMessage());
         //}
         $db = new mysqli(DB_URL, DB_USER, DB_PASS, DB_NAME, 3306);

         if ($db->connect_errno) {
            echo "Failed to connect to MySQL: (" . $db->connect_errno . ") " . $db->connect_error;
         }
         //echo $db->host_info . "\n";
         $GLOBALS["ComicDB_db"] = $db;
      }
      return $GLOBALS["ComicDB_db"];
   }
}

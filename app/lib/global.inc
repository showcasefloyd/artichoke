<?php
// -*- Mode: PHP; indent-tabs-mode: nil; -*-
// add the application lib directory to the system include path
$debugMode = getenv('ARTICHOKE_DEBUG');
if ($debugMode === '1' || strtolower((string)$debugMode) === 'true') {
	ini_set('display_errors', '1');
	error_reporting(E_ALL);
} else {
	ini_set('display_errors', '0');
	error_reporting(E_ALL ^ E_DEPRECATED);
}

$libdir = dirname(realpath(__FILE__));

$include_path = $libdir .":". ini_get("include_path") .":". "../";

ini_set("include_path", $include_path);

// read config file
include_once("config.inc");

// configure the database dsn
include_once("ComicDB/DB.php");
ComicDB_DB::dsn(DB_URL);

#grabs all the vaules pass to the app and creates variables for them.
foreach($_GET as $name => $value) {
	$$name = $value;
	//echo "GET $". $name .' = '. $value . "<br />";

}

#grabs all the vaules pass to the app and creates variables for them.
foreach($_POST as $name => $value) {
	$$name = $value;
	//echo "POST $". $name .' = '. $value . "<br />";
}

function ComicDB_pageTitle() {
    $chunks = func_get_args();
    array_unshift($chunks, HTML_TITLE_PREFIX);
    return htmlspecialchars(implode(HTML_TITLE_SEPARATOR, $chunks));
}

/* Auto Load Function */
function autoload($className){
	$file = dirname(__FILE__) . '/ComicDB/'. $className .'.php';
	if(file_exists($file)){
		include_once($file);
	}
}

/* Call auto loader */
spl_autoload_register('autoload');

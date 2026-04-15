<?php
/*
 * phpComicDB config file - 2012
 */

// This is for PHP PEAR (why?)
// database url in the form
// driver://user:password@host/database
//define('DB_URL', "mysql://comicdb:comicdb@localhost/comicdb");

//define('DB_URL','localhost');
//define('DB_USER','comicdb');
//define('DB_PASS','comicdb');
//define('DB_NAME','comicdb');

// Local defaults can be overridden via environment variables.
define('DB_URL', getenv('ARTICHOKE_DB_HOST') ?: 'localhost');
define('DB_USER', getenv('ARTICHOKE_DB_USER') ?: 'comicdb');
define('DB_PASS', getenv('ARTICHOKE_DB_PASS') ?: 'comicdb');
define('DB_NAME', getenv('ARTICHOKE_DB_NAME') ?: 'comicdb');

// prefixed to the title of every HTML page
define('HTML_TITLE_PREFIX', 'jsComicDB');

// separates the title prefix and other components of the page title
define('HTML_TITLE_SEPARATOR', ' | ');

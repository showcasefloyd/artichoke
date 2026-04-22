<?php
/**
 * PHPUnit bootstrap for ComicDB tests.
 *
 * Connects to a test database using environment variables with sensible
 * defaults that match the Docker dev stack (database name suffixed _test).
 *
 * Required env vars (override as needed):
 *   ARTICHOKE_DB_HOST  – default: localhost
 *   ARTICHOKE_DB_USER  – default: comicdb
 *   ARTICHOKE_DB_PASS  – default: comicdb
 *   ARTICHOKE_TEST_DB  – default: comicdb_test
 */

// Vendor autoloader (includes PHPUnit + PEAR shim)
require_once __DIR__ . '/../app/vendor/autoload.php';

// Point PHP include path at app/lib and app/ so ComicDB includes resolve
// identically to how they run in production.
// - "ComicDB/DB.php" etc. are found via app/lib
// - "vendor/pear-pear.php.net/PEAR/PEAR.php" in Object.php resolves via app/
$libDir = realpath(__DIR__ . '/../app/lib');
$appDir = realpath(__DIR__ . '/../app');
ini_set('include_path', $libDir . PATH_SEPARATOR . $appDir . PATH_SEPARATOR . ini_get('include_path'));

// DB constants – use a dedicated test database to avoid clobbering real data
define('DB_URL', getenv('ARTICHOKE_DB_HOST') ?: 'localhost');
define('DB_USER', getenv('ARTICHOKE_DB_USER') ?: 'comicdb');
define('DB_PASS', getenv('ARTICHOKE_DB_PASS') ?: 'comicdb');
define('DB_NAME', getenv('ARTICHOKE_TEST_DB') ?: 'comicdb_test');

// DB_OK constant expected by legacy save() return paths
if (! defined('DB_OK')) {
    define('DB_OK', 1);
}

// Bootstrap the test database schema once per suite run
require_once __DIR__ . '/db_bootstrap.php';

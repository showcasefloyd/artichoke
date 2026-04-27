<?php
/**
 * ComicVine API Client
 *
 * Provides methods to search and retrieve comic data from the ComicVine API.
 * API documentation: https://comicvine.gamespot.com/api/documentation
 *
 * IMPORTANT: ComicVine Terms of Use compliance:
 * - Non-commercial use only
 * - Rate limited to 200 requests/hour (we use 1s delay + caching)
 * - Must attribute: "Data provided by Comic Vine" with link
 * - Do not redistribute data
 */

include_once(__DIR__ . '/DB.php');

class ComicDB_ComicVine {

	const API_BASE = 'https://comicvine.gamespot.com/api';
	const RATE_LIMIT_DELAY = 1; // seconds between requests

	// Cache TTL values (in seconds)
	const CACHE_TTL_SEARCH = 3600;      // 1 hour for search results
	const CACHE_TTL_VOLUME = 86400;     // 24 hours for volume details
	const CACHE_TTL_ISSUE = 86400;      // 24 hours for issue details
	const CACHE_TTL_VOLUME_ISSUES = 86400; // 24 hours for volume issue lists

	// Attribution text (required by ToS)
	const ATTRIBUTION_TEXT = 'Data provided by Comic Vine';
	const ATTRIBUTION_URL = 'https://comicvine.gamespot.com';

	private static $lastRequestTime = 0;

	/**
	 * Search for volumes (series) by name
	 *
	 * @param string $titleName The title to search for (e.g., "Batman", "Amazing Spider-Man")
	 * @return array Array of matching volumes with basic info
	 */
	public static function searchVolumes($titleName) {
		$params = array(
			'resources' => 'volume',
			'query' => $titleName,
			'field_list' => 'id,name,start_year,count_of_issues,publisher,image,deck',
			'limit' => 50
		);

		$response = self::request('/search', $params);

		if (!$response || !isset($response['results'])) {
			return array();
		}

		$volumes = array();
		foreach ($response['results'] as $vol) {
			$volumes[] = array(
				'cv_id' => $vol['id'],
				'name' => $vol['name'],
				'start_year' => isset($vol['start_year']) ? $vol['start_year'] : null,
				'issue_count' => isset($vol['count_of_issues']) ? $vol['count_of_issues'] : 0,
				'publisher' => isset($vol['publisher']['name']) ? $vol['publisher']['name'] : null,
				'image' => isset($vol['image']['small_url']) ? $vol['image']['small_url'] : null,
				'deck' => isset($vol['deck']) ? $vol['deck'] : null
			);
		}

		return $volumes;
	}

	/**
	 * Get a specific volume with its full issue list
	 *
	 * @param int $cvVolumeId The ComicVine volume ID
	 * @return array|null Volume data with issues array, or null if not found
	 */
	public static function getVolume($cvVolumeId) {
		$params = array(
			'field_list' => 'id,name,start_year,count_of_issues,publisher,image,deck,issues'
		);

		$response = self::request("/volume/4050-{$cvVolumeId}", $params);

		if (!$response || !isset($response['results'])) {
			return null;
		}

		$vol = $response['results'];

		$issues = array();
		if (isset($vol['issues']) && is_array($vol['issues'])) {
			foreach ($vol['issues'] as $issue) {
				$issues[] = array(
					'cv_id' => $issue['id'],
					'issue_number' => isset($issue['issue_number']) ? $issue['issue_number'] : null,
					'name' => isset($issue['name']) ? $issue['name'] : null
				);
			}
		}

		return array(
			'cv_id' => $vol['id'],
			'name' => $vol['name'],
			'start_year' => isset($vol['start_year']) ? $vol['start_year'] : null,
			'issue_count' => isset($vol['count_of_issues']) ? $vol['count_of_issues'] : 0,
			'publisher' => isset($vol['publisher']['name']) ? $vol['publisher']['name'] : null,
			'image' => isset($vol['image']['small_url']) ? $vol['image']['small_url'] : null,
			'deck' => isset($vol['deck']) ? $vol['deck'] : null,
			'issues' => $issues
		);
	}

	/**
	 * Get detailed information about a specific issue
	 *
	 * @param int $cvIssueId The ComicVine issue ID
	 * @return array|null Issue data or null if not found
	 */
	public static function getIssue($cvIssueId) {
		$params = array(
			'field_list' => 'id,issue_number,name,cover_date,store_date,volume,image,deck,description'
		);

		$response = self::request("/issue/4000-{$cvIssueId}", $params);

		if (!$response || !isset($response['results'])) {
			return null;
		}

		$issue = $response['results'];

		return array(
			'cv_id' => $issue['id'],
			'issue_number' => isset($issue['issue_number']) ? $issue['issue_number'] : null,
			'name' => isset($issue['name']) ? $issue['name'] : null,
			'cover_date' => isset($issue['cover_date']) ? $issue['cover_date'] : null,
			'store_date' => isset($issue['store_date']) ? $issue['store_date'] : null,
			'volume_id' => isset($issue['volume']['id']) ? $issue['volume']['id'] : null,
			'volume_name' => isset($issue['volume']['name']) ? $issue['volume']['name'] : null,
			'image' => isset($issue['image']['small_url']) ? $issue['image']['small_url'] : null,
			'deck' => isset($issue['deck']) ? $issue['deck'] : null
		);
	}

	/**
	 * Search for issues within a volume by issue number
	 *
	 * @param int $cvVolumeId The ComicVine volume ID
	 * @param string $issueNumber The issue number to find
	 * @return array Array of matching issues
	 */
	public static function searchIssuesInVolume($cvVolumeId, $issueNumber) {
		$params = array(
			'filter' => "volume:{$cvVolumeId},issue_number:{$issueNumber}",
			'field_list' => 'id,issue_number,name,cover_date,store_date,volume,image'
		);

		$response = self::request('/issues', $params);

		if (!$response || !isset($response['results'])) {
			return array();
		}

		$issues = array();
		foreach ($response['results'] as $issue) {
			$issues[] = array(
				'cv_id' => $issue['id'],
				'issue_number' => isset($issue['issue_number']) ? $issue['issue_number'] : null,
				'name' => isset($issue['name']) ? $issue['name'] : null,
				'cover_date' => isset($issue['cover_date']) ? $issue['cover_date'] : null,
				'store_date' => isset($issue['store_date']) ? $issue['store_date'] : null,
				'volume_id' => isset($issue['volume']['id']) ? $issue['volume']['id'] : null,
				'volume_name' => isset($issue['volume']['name']) ? $issue['volume']['name'] : null,
				'image' => isset($issue['image']['small_url']) ? $issue['image']['small_url'] : null
			);
		}

		return $issues;
	}

	/**
	 * Get all issues for a volume with cover dates (for timeline/grid display)
	 *
	 * @param int $cvVolumeId The ComicVine volume ID
	 * @param int $offset Pagination offset
	 * @param int $limit Results per page (max 100)
	 * @return array Array with 'issues' and 'total' count
	 */
	public static function getVolumeIssues($cvVolumeId, $offset = 0, $limit = 100) {
		$params = array(
			'filter' => "volume:{$cvVolumeId}",
			'field_list' => 'id,issue_number,name,cover_date,image',
			'sort' => 'cover_date:asc',
			'offset' => $offset,
			'limit' => min($limit, 100)
		);

		$response = self::request('/issues', $params);

		if (!$response || !isset($response['results'])) {
			return array('issues' => array(), 'total' => 0);
		}

		$issues = array();
		foreach ($response['results'] as $issue) {
			$issues[] = array(
				'cv_id' => $issue['id'],
				'issue_number' => isset($issue['issue_number']) ? $issue['issue_number'] : null,
				'name' => isset($issue['name']) ? $issue['name'] : null,
				'cover_date' => isset($issue['cover_date']) ? $issue['cover_date'] : null,
				'image' => isset($issue['image']['icon_url']) ? $issue['image']['icon_url'] : null
			);
		}

		return array(
			'issues' => $issues,
			'total' => isset($response['number_of_total_results']) ? $response['number_of_total_results'] : count($issues)
		);
	}

	/**
	 * Get ALL issues for a volume (auto-paginate through results)
	 *
	 * @param int $cvVolumeId ComicVine volume ID
	 * @return array Array with 'issues' (all of them) and 'total' count
	 */
	public static function getAllVolumeIssues($cvVolumeId) {
		$allIssues = array();
		$offset = 0;
		$limit = 100;
		$total = null;

		do {
			$result = self::getVolumeIssues($cvVolumeId, $offset, $limit);

			if (empty($result['issues'])) {
				break;
			}

			$allIssues = array_merge($allIssues, $result['issues']);
			$total = $result['total'];
			$offset += $limit;

			// Safety limit: don't fetch more than 2000 issues
			if ($offset >= 2000) {
				break;
			}
		} while (count($allIssues) < $total);

		return array(
			'issues' => $allIssues,
			'total' => $total !== null ? $total : count($allIssues)
		);
	}

	/**
	 * Resolve an issue by title name, issue number, and cover date
	 *
	 * @param string $titleName The title/volume name
	 * @param string $issueNumber The issue number
	 * @param string $coverDate Cover date in YYYY-MM format
	 * @return array|null Matched issue with volume info, or null if not found
	 */
	public static function resolveIssue($titleName, $issueNumber, $coverDate) {
		// First, search for volumes matching the title
		$volumes = self::searchVolumes($titleName);

		if (empty($volumes)) {
			return null;
		}

		// Parse the target cover date
		$targetYear = null;
		$targetMonth = null;
		if ($coverDate) {
			$parts = explode('-', $coverDate);
			$targetYear = isset($parts[0]) ? (int) $parts[0] : null;
			$targetMonth = isset($parts[1]) ? (int) $parts[1] : null;
		}

		// For each matching volume, search for the issue
		foreach ($volumes as $volume) {
			$issues = self::searchIssuesInVolume($volume['cv_id'], $issueNumber);

			foreach ($issues as $issue) {
				// Check if cover date matches (if provided)
				if ($coverDate && $issue['cover_date']) {
					$issueParts = explode('-', $issue['cover_date']);
					$issueYear = isset($issueParts[0]) ? (int) $issueParts[0] : null;
					$issueMonth = isset($issueParts[1]) ? (int) $issueParts[1] : null;

					if ($issueYear === $targetYear && $issueMonth === $targetMonth) {
						return array(
							'issue' => $issue,
							'volume' => $volume
						);
					}
				}
			}
		}

		// If no exact match, return the first result from the first volume
		if (!empty($volumes)) {
			$issues = self::searchIssuesInVolume($volumes[0]['cv_id'], $issueNumber);
			if (!empty($issues)) {
				return array(
					'issue' => $issues[0],
					'volume' => $volumes[0],
					'exact_match' => false
				);
			}
		}

		return null;
	}

	/**
	 * Make a request to the ComicVine API (with caching)
	 *
	 * @param string $endpoint The API endpoint (e.g., '/search', '/volume/4050-123')
	 * @param array $params Query parameters
	 * @param int $cacheTtl Cache TTL in seconds (0 to disable)
	 * @return array|null Decoded JSON response or null on error
	 */
	private static function request($endpoint, $params = array(), $cacheTtl = null) {
		// Determine cache TTL based on endpoint if not specified
		if ($cacheTtl === null) {
			if (strpos($endpoint, '/search') === 0) {
				$cacheTtl = self::CACHE_TTL_SEARCH;
			} elseif (strpos($endpoint, '/volume/') === 0) {
				$cacheTtl = self::CACHE_TTL_VOLUME;
			} elseif (strpos($endpoint, '/issue/') === 0) {
				$cacheTtl = self::CACHE_TTL_ISSUE;
			} elseif (strpos($endpoint, '/issues') === 0) {
				$cacheTtl = self::CACHE_TTL_VOLUME_ISSUES;
			} else {
				$cacheTtl = self::CACHE_TTL_SEARCH;
			}
		}

		// Check cache first
		$cacheKey = self::generateCacheKey($endpoint, $params);
		$cachedData = self::getCache($cacheKey);
		if ($cachedData !== null) {
			return $cachedData;
		}

		$apiKey = defined('COMICVINE_API_KEY') ? COMICVINE_API_KEY : '';

		if (empty($apiKey)) {
			error_log('ComicVine API key not configured');
			return null;
		}

		// Rate limiting
		$now = microtime(true);
		$elapsed = $now - self::$lastRequestTime;
		if ($elapsed < self::RATE_LIMIT_DELAY) {
			usleep((int) ((self::RATE_LIMIT_DELAY - $elapsed) * 1000000));
		}
		self::$lastRequestTime = microtime(true);

		// Build URL
		$params['api_key'] = $apiKey;
		$params['format'] = 'json';

		$url = self::API_BASE . $endpoint . '?' . http_build_query($params);

		// Make request with User-Agent (required by ComicVine)
		$context = stream_context_create(array(
			'http' => array(
				'method' => 'GET',
				'header' => "User-Agent: jsComicDB/1.0 (Comic Collection App)\r\n",
				'timeout' => 30
			)
		));

		$response = @file_get_contents($url, false, $context);

		if ($response === false) {
			error_log("ComicVine API request failed: {$endpoint}");
			return null;
		}

		$data = json_decode($response, true);

		if (!$data) {
			error_log("ComicVine API response parse error: {$endpoint}");
			return null;
		}

		// Check for API errors
		if (isset($data['status_code']) && $data['status_code'] !== 1) {
			error_log("ComicVine API error: " . (isset($data['error']) ? $data['error'] : 'Unknown'));
			return null;
		}

		// Store in cache for future requests
		if ($cacheTtl > 0) {
			self::setCache($cacheKey, $data, $cacheTtl);
		}

		return $data;
	}

	/**
	 * Generate a cache key for an API request
	 */
	private static function generateCacheKey($endpoint, $params) {
		// Remove api_key from cache key (it's not relevant for caching)
		unset($params['api_key']);
		unset($params['format']);
		ksort($params);
		return md5($endpoint . '|' . json_encode($params));
	}

	/**
	 * Get cached response if available and not expired
	 */
	private static function getCache($cacheKey) {
		$db = ComicDB_DB::db();
		if (!$db) return null;

		$cacheKey = $db->real_escape_string($cacheKey);
		$query = "SELECT response_data FROM cv_cache
				  WHERE cache_key = '{$cacheKey}'
				  AND expires_at > NOW()
				  LIMIT 1";

		$result = @$db->query($query);
		if (!$result || $result->num_rows === 0) {
			return null;
		}

		$row = $result->fetch_assoc();
		return json_decode($row['response_data'], true);
	}

	/**
	 * Store response in cache
	 */
	private static function setCache($cacheKey, $data, $ttl) {
		$db = ComicDB_DB::db();
		if (!$db) return;

		$cacheKey = $db->real_escape_string($cacheKey);
		$responseData = $db->real_escape_string(json_encode($data));

		// Use INSERT ... ON DUPLICATE KEY UPDATE for upsert
		$query = "INSERT INTO cv_cache (cache_key, response_data, expires_at)
				  VALUES ('{$cacheKey}', '{$responseData}', DATE_ADD(NOW(), INTERVAL {$ttl} SECOND))
				  ON DUPLICATE KEY UPDATE
				  response_data = '{$responseData}',
				  expires_at = DATE_ADD(NOW(), INTERVAL {$ttl} SECOND)";

		@$db->query($query);
	}

	/**
	 * Clear expired cache entries (housekeeping)
	 */
	public static function clearExpiredCache() {
		$db = ComicDB_DB::db();
		if (!$db) return;

		$query = "DELETE FROM cv_cache WHERE expires_at < NOW()";
		@$db->query($query);
	}

	/**
	 * Get attribution info for display in UI
	 * @return array Attribution text and URL
	 */
	public static function getAttribution() {
		return array(
			'text' => self::ATTRIBUTION_TEXT,
			'url' => self::ATTRIBUTION_URL
		);
	}
}

?>

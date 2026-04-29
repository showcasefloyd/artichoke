<?php

class ComicVine
{
    const API_BASE = 'https://comicvine.gamespot.com/api';
    const CACHE_TTL_SECONDS = 604800; // 7 days

    private static function apiKey()
    {
        if (defined('COMICVINE_API_KEY') && COMICVINE_API_KEY !== '') {
            return COMICVINE_API_KEY;
        }
        $env = getenv('COMICVINE_API_KEY');
        return $env ?: '';
    }

    private static function getCached($db, $type, $id)
    {
        $typeEsc = $db->real_escape_string($type);
        $idEsc   = $db->real_escape_string($id);
        $ttl     = self::CACHE_TTL_SECONDS;
        $query   = "SELECT payload FROM comicvine_cache"
            . " WHERE resource_type='$typeEsc' AND resource_id='$idEsc'"
            . " AND fetched_at > DATE_SUB(NOW(), INTERVAL $ttl SECOND) LIMIT 1";
        $result = $db->query($query);
        if (!$result || $result->num_rows === 0) {
            return null;
        }
        $row = $result->fetch_assoc();
        return json_decode($row['payload'], true);
    }

    private static function putCached($db, $type, $id, $data)
    {
        $typeEsc    = $db->real_escape_string($type);
        $idEsc      = $db->real_escape_string($id);
        $payloadEsc = $db->real_escape_string(json_encode($data));
        $db->query(
            "INSERT INTO comicvine_cache (resource_type, resource_id, payload)"
            . " VALUES ('$typeEsc', '$idEsc', '$payloadEsc')"
            . " ON DUPLICATE KEY UPDATE payload='$payloadEsc', fetched_at=NOW()"
        );
    }

    private static function httpGet($url)
    {
        $ctx  = stream_context_create(['http' => ['header' => "User-Agent: Artichoke/1.0\r\n", 'timeout' => 10]]);
        $body = @file_get_contents($url, false, $ctx);
        if ($body === false) {
            return null;
        }
        return json_decode($body, true);
    }

    /**
     * Search ComicVine volumes by query string.
     * Returns an array of volume summaries, or ['error' => '...'] on failure.
     */
    public static function searchVolumes($db, $query)
    {
        $cacheId = 'search:' . strtolower(trim($query));
        $cached  = self::getCached($db, 'volume_search', $cacheId);
        if ($cached !== null) {
            return $cached;
        }

        $key = self::apiKey();
        if ($key === '') {
            return ['error' => 'COMICVINE_API_KEY is not configured'];
        }

        $url = self::API_BASE . '/search/?api_key=' . urlencode($key)
            . '&format=json&resources=volume'
            . '&query=' . urlencode($query)
            . '&field_list=id,name,publisher,count_of_issues,start_year'
            . '&limit=10';

        $response = self::httpGet($url);
        if (!$response || (int) ($response['status_code'] ?? 0) !== 1) {
            return ['error' => 'ComicVine API request failed'];
        }

        $results = [];
        foreach ($response['results'] ?? [] as $item) {
            $results[] = [
                'id'             => (int) $item['id'],
                'name'           => $item['name'] ?? '',
                'publisher'      => $item['publisher']['name'] ?? null,
                'countOfIssues'  => (int) ($item['count_of_issues'] ?? 0),
                'startYear'      => isset($item['start_year']) ? (int) $item['start_year'] : null,
            ];
        }

        self::putCached($db, 'volume_search', $cacheId, $results);
        return $results;
    }

    /**
     * Fetch all issues for a ComicVine volume by its numeric ID.
     * Returns a volume detail array (including issues[]), or ['error' => '...'] on failure.
     */
    public static function getVolumeIssues($db, $volumeId)
    {
        $cacheId = (string) (int) $volumeId;
        $cached  = self::getCached($db, 'volume', $cacheId);
        if ($cached !== null) {
            return $cached;
        }

        $key = self::apiKey();
        if ($key === '') {
            return ['error' => 'COMICVINE_API_KEY is not configured'];
        }

        $url = self::API_BASE . '/volume/4050-' . (int) $volumeId . '/?api_key=' . urlencode($key)
            . '&format=json'
            . '&field_list=id,name,publisher,count_of_issues,start_year,issues';

        $response = self::httpGet($url);
        if (!$response || (int) ($response['status_code'] ?? 0) !== 1) {
            return ['error' => 'ComicVine API request failed'];
        }

        $vol    = $response['results'] ?? [];
        $issues = [];
        foreach ($vol['issues'] ?? [] as $issue) {
            $issues[] = [
                'id'          => (int) $issue['id'],
                'issueNumber' => $issue['issue_number'] ?? null,
            ];
        }

        $result = [
            'id'            => (int) ($vol['id'] ?? $volumeId),
            'name'          => $vol['name'] ?? '',
            'publisher'     => $vol['publisher']['name'] ?? null,
            'countOfIssues' => (int) ($vol['count_of_issues'] ?? 0),
            'startYear'     => isset($vol['start_year']) ? (int) $vol['start_year'] : null,
            'issues'        => $issues,
        ];

        self::putCached($db, 'volume', $cacheId, $result);
        return $result;
    }

    /**
     * Fetch detail for a single ComicVine issue by its numeric ID.
     * Returns an array with cover_date, story_title, cover_image_url, or ['error' => '...'] on failure.
     */
    public static function getIssueDetail($db, $comicvineIssueId)
    {
        $cacheId = (string) (int) $comicvineIssueId;
        $cached  = self::getCached($db, 'issue', $cacheId);
        if ($cached !== null) {
            return $cached;
        }

        $key = self::apiKey();
        if ($key === '') {
            return ['error' => 'COMICVINE_API_KEY is not configured'];
        }

        $url = self::API_BASE . '/issue/4000-' . (int) $comicvineIssueId . '/?api_key=' . urlencode($key)
            . '&format=json'
            . '&field_list=id,cover_date,name,image';

        $response = self::httpGet($url);
        if (!$response || (int) ($response['status_code'] ?? 0) !== 1) {
            return ['error' => 'ComicVine API request failed'];
        }

        $r      = $response['results'] ?? [];
        $result = [
            'cover_date'      => $r['cover_date'] ?? null,
            'story_title'     => $r['name'] ?? null,
            'cover_image_url' => $r['image']['medium_url'] ?? ($r['image']['original_url'] ?? null),
        ];

        self::putCached($db, 'issue', $cacheId, $result);
        return $result;
    }
}

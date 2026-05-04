<?php
require_once './lib/global.inc';
include_once "ComicDB/Titles.php";
include_once "ComicDB/Title.php";
include_once "ComicDB/Serieses.php";
include_once "ComicDB/Issue.php";
include_once "ComicDB/Publisher.php";
include_once "ComicDB/Publishers.php";
include_once "ComicDB/SeriesTypes.php";

// Grab all Titles (used by GET /list)
function grabList()
{
    $data        = [];
    $titlesArray = [];
    $titlesList  = new ComicDB_Titles();
    $titles      = $titlesList->getAll();
    foreach ($titles as $t) {
        array_push($titlesArray, ['id' => $t->id, 'name' => $t->name]);
    }
    $data['titles'] = $titlesArray;
    return json_encode($data);
}

// Grab a Title
function grabTitle($id)
{

    $title      = new ComicDB_Title($id);
    $titleArray = $title->select();

    return json_encode($titleArray);
}

// Grab Series
function grabSeries($id)
{
    $seriesArray = [];
    $seriesList  = new ComicDB_Serieses($id);
    $series      = $seriesList->getAll();

    if (count($series) > 0) {
        foreach ($series as $s) {
            array_push($seriesArray, ['id' => $s->id, 'title' => $s->name]);
        }
    } else {
        array_push($seriesArray, ['id' => 0, 'title' => "No series"]);
    }

    $data['series_id'] = $id;
    $data['series']    = $seriesArray;
    return json_encode($data);
}

function ensureSeriesTotalSchema($db)
{
    static $ensured = false;
    if ($ensured) {
        return;
    }

    $seriesColumnResult = $db->query("SHOW COLUMNS FROM series LIKE 'total_issues'");
    if (! $seriesColumnResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    if ($seriesColumnResult->num_rows === 0) {
        $alterSeriesQuery = "ALTER TABLE series ADD COLUMN total_issues INT NOT NULL DEFAULT 1 AFTER final_issue";
        if (! $db->query($alterSeriesQuery)) {
            die('There was an error running the query [' . $db->error . ']');
        }
    } else {
        $defaultResult = $db->query("SHOW COLUMNS FROM series LIKE 'total_issues'");
        if (! $defaultResult) {
            die('There was an error running the query [' . $db->error . ']');
        }
        $defaultRow = $defaultResult->fetch_assoc();
        if ($defaultRow && isset($defaultRow['Default']) && (string) $defaultRow['Default'] !== '1') {
            if (! $db->query("ALTER TABLE series MODIFY COLUMN total_issues INT NOT NULL DEFAULT 1")) {
                die('There was an error running the query [' . $db->error . ']');
            }
        }
    }
    $ensured = true;
}

function ensureIssueDetailSchema($db)
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $cols = [
        'cover_image_url'    => 'VARCHAR(1024) NULL',
        'comicvine_issue_id' => 'INT NULL',
        'owned_at'           => 'TIMESTAMP NULL DEFAULT NULL',
    ];
    foreach ($cols as $col => $def) {
        $result = $db->query("SHOW COLUMNS FROM issues LIKE '$col'");
        if ($result && $result->num_rows === 0) {
            $db->query("ALTER TABLE issues ADD COLUMN $col $def");
        }
    }
    $ensured = true;
}

function grabSeriesList($dataJson)
{
    $filters     = json_decode($dataJson, true);
    $titleId     = isset($filters['titleId']) ? (int) $filters['titleId'] : 0;
    $publisherId = isset($filters['publisherId']) ? (int) $filters['publisherId'] : 0;
    $db          = ComicDB_DB::db();
    ensureSeriesTotalSchema($db);
    $whereClauses = [];
    if ($titleId > 0) {
        $whereClauses[] = "s.title = $titleId";
    }

    if ($publisherId > 0) {
        $whereClauses[] = "p.id = $publisherId";
    }

    $where = '';
    if (count($whereClauses) > 0) {
        $where = 'WHERE ' . implode(' AND ', $whereClauses);
    }
    $minimumIssueCount = isset($filters['minimumIssueCount']) ? (int) $filters['minimumIssueCount'] : 0;
    $having            = "HAVING COUNT(i.id) >= $minimumIssueCount";

    $query = "
      SELECT s.id,
             s.title AS title_id,
             s.name,
             s.volume,
             s.start_year,
             p.name AS publisher,
             t.name AS title_name,
             COALESCE(s.total_issues, 0) AS total_issues,
             COUNT(i.id) AS issue_count,
             GREATEST(COALESCE(s.total_issues, 0) - COUNT(i.id), 0) AS missing_issues,
             CASE
                 WHEN COALESCE(s.total_issues, 0) > 0
                 THEN LEAST(ROUND((COUNT(i.id) / COALESCE(s.total_issues, 0)) * 100), 100)
                 ELSE 0
             END AS completion_percent
        FROM series s
   LEFT JOIN titles t ON t.id = s.title
    LEFT JOIN publisher p ON p.id = s.publisher_id
    LEFT JOIN issues i ON i.series = s.id
        $where
     GROUP BY s.id, s.title, s.name, s.volume, s.start_year, s.publisher_id, p.name, t.name, s.total_issues
      $having
     ORDER BY t.name ASC, s.name ASC
    ";
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }

    $list = [];
    while ($row = $result->fetch_assoc()) {
        $list[] = [
            'id'                => (int) $row['id'],
            'titleId'           => (int) $row['title_id'],
            'name'              => $row['name'],
            'volume'            => isset($row['volume']) ? (int) $row['volume'] : 0,
            'startYear'         => isset($row['start_year']) ? (int) $row['start_year'] : 0,
            'publisher'         => $row['publisher'],
            'titleName'         => $row['title_name'] ?? '',
            'issueCount'        => isset($row['issue_count']) ? (int) $row['issue_count'] : 0,
            'totalIssues'       => isset($row['total_issues']) ? (int) $row['total_issues'] : 0,
            'missingIssues'     => isset($row['missing_issues']) ? (int) $row['missing_issues'] : 0,
            'completionPercent' => isset($row['completion_percent']) ? (int) $row['completion_percent'] : 0,
        ];
    }

    return json_encode(['series' => $list]);
}

function grabSerieById($id)
{
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $series = new ComicDB_Series($id);
    $series->restore();
    return json_encode([
        'id'           => $series->id(),
        'titleId'      => $series->titleId(),
        'name'         => $series->name(),
        'volume'       => $series->volume(),
        'startYear'    => $series->startYear(),
        'publisher'    => $series->publisher(),
        'type'         => $series->type(),
        'defaultPrice' => $series->defaultPrice(),
        'firstIssue'   => $series->firstIssue(),
        'finalIssue'   => $series->finalIssue(),
        'totalIssues'  => $series->totalIssues(),
        'subscribed'   => $series->subscribed(),
        'comments'     => $series->comments(),
    ]);
}

// Create a Title
function createTitle($name)
{
    $title = new ComicDB_Title();
    $title->name($name);
    $title->save();
    return json_encode(['id' => $title->id(), 'name' => $title->name()]);
}

// Update a Title
function updateTitle($id, $name)
{
    $title = new ComicDB_Title($id);
    $title->restore();
    $title->name($name);
    $title->save();
    return json_encode(['id' => $title->id(), 'name' => $title->name()]);
}

// Delete a Title
function deleteTitle($id)
{
    $title = new ComicDB_Title($id);
    $title->restore();
    $title->remove();
    return json_encode(['deleted' => true, 'id' => (int) $id]);
}

// Create a Series
function createSeries($dataJson)
{
    $data = json_decode($dataJson, true);
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $series = new ComicDB_Series();
    $series->titleId($data['titleId']);
    $series->name($data['name']);
    if (isset($data['volume'])) {
        $series->volume($data['volume']);
    }
    if (isset($data['startYear'])) {
        $series->startYear($data['startYear']);
    }
    $series->publisher($data['publisher']);
    if (isset($data['type'])) {
        $series->type($data['type']);
    }

    if (isset($data['defaultPrice'])) {
        $series->defaultPrice($data['defaultPrice']);
    }

    if (isset($data['firstIssue'])) {
        $series->firstIssue($data['firstIssue']);
    }

    if (isset($data['finalIssue'])) {
        $series->finalIssue($data['finalIssue']);
    }

    if (isset($data['totalIssues'])) {
        $series->totalIssues($data['totalIssues']);
    }

    if (isset($data['subscribed'])) {
        $series->subscribed($data['subscribed']);
    }

    if (isset($data['comments'])) {
        $series->comments($data['comments']);
    }

    $series->save();
    return json_encode(['id' => $series->id(), 'name' => $series->name()]);
}

// Update a Series
function updateSeries($id, $dataJson)
{
    $data = json_decode($dataJson, true);
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $series = new ComicDB_Series($id);
    $series->restore();
    if (isset($data['titleId']) && (int) $data['titleId'] > 0) {
        $series->titleId($data['titleId']);
    }

    if (isset($data['name'])) {
        $series->name($data['name']);
    }

    if (isset($data['publisher'])) {
        $series->publisher($data['publisher']);
    }

    if (isset($data['volume'])) {
        $series->volume($data['volume']);
    }

    if (isset($data['startYear'])) {
        $series->startYear($data['startYear']);
    }

    if (isset($data['type'])) {
        $series->type($data['type']);
    }

    if (isset($data['defaultPrice'])) {
        $series->defaultPrice($data['defaultPrice']);
    }

    if (isset($data['firstIssue'])) {
        $series->firstIssue($data['firstIssue']);
    }

    if (isset($data['finalIssue'])) {
        $series->finalIssue($data['finalIssue']);
    }

    if (isset($data['totalIssues'])) {
        $series->totalIssues($data['totalIssues']);
    }

    if (isset($data['subscribed'])) {
        $series->subscribed($data['subscribed']);
    }

    if (isset($data['comments'])) {
        $series->comments($data['comments']);
    }

    $series->save();
    return json_encode(['id' => $series->id(), 'name' => $series->name()]);
}

// Delete a Series
function deleteSeries($id)
{
    $series = new ComicDB_Series($id);
    $series->restore();
    $series->remove();
    return json_encode(['deleted' => true, 'id' => (int) $id]);
}

function applyIssueData(ComicDB_Issue $issue, array $data)
{
    $fieldMap = [
        'seriesId'      => 'seriesId',
        'number'        => 'number',
        'storyTitle'    => 'storyTitle',
        'sort'          => 'sort',
        'printRun'      => 'printRun',
        'quantity'      => 'quantity',
        'coverDate'     => 'coverDate',
        'location'      => 'location',
        'type'          => 'type',
        'status'        => 'status',
        'condition'     => 'condition',
        'coverPrice'    => 'coverPrice',
        'purchasePrice' => 'purchasePrice',
        'purchaseDate'  => 'purchaseDate',
        'guideValue'    => 'guideValue',
        'guide'         => 'guide',
        'issueValue'    => 'issueValue',
        'comments'      => 'comments',
    ];

    foreach ($fieldMap as $key => $method) {
        if (isset($data[$key])) {
            $issue->$method($data[$key]);
        }
    }
}

// Create an Issue
function createIssue($dataJson)
{
    $data = json_decode($dataJson, true);
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $issue = new ComicDB_Issue();
    applyIssueData($issue, $data);

    $issue->save();
    return json_encode(['id' => $issue->id(), 'number' => $issue->number()]);
}

// Update an Issue
function updateIssue($id, $dataJson)
{
    $data = json_decode($dataJson, true);
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $issue = new ComicDB_Issue($id);
    $issue->restore();
    applyIssueData($issue, $data);

    $issue->save();
    return json_encode(['id' => $issue->id(), 'number' => $issue->number()]);
}

// Delete an Issue
function deleteIssue($id)
{
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $issue = new ComicDB_Issue($id);
    $issue->restore();
    $issue->remove();
    return json_encode(['deleted' => true, 'id' => (int) $id]);
}

function grabIssuesList($dataJson)
{
    $filters      = json_decode($dataJson, true);
    $titleId      = isset($filters['titleId']) ? (int) $filters['titleId'] : 0;
    $seriesId     = isset($filters['seriesId']) ? (int) $filters['seriesId'] : 0;
    $db           = ComicDB_DB::db();
    $whereClauses = [];
    if ($titleId > 0) {
        $whereClauses[] = "s.title = $titleId";
    }

    if ($seriesId > 0) {
        $whereClauses[] = "i.series = $seriesId";
    }

    $where = '';
    if (count($whereClauses) > 0) {
        $where = 'WHERE ' . implode(' AND ', $whereClauses);
    }

    $query = "
      SELECT i.id,
             i.number,
             i.sort,
             i.series AS series_id,
             s.name AS series_name,
             s.title AS title_id,
             t.name AS title_name
        FROM issues i
   LEFT JOIN series s ON s.id = i.series
   LEFT JOIN titles t ON t.id = s.title
       $where
    ORDER BY t.name ASC,
             s.name ASC,
             CASE WHEN i.sort IS NOT NULL AND i.sort > 0 THEN 0 ELSE 1 END ASC,
             CASE WHEN i.sort IS NOT NULL AND i.sort > 0 THEN i.sort ELSE 2147483647 END ASC,
             CASE WHEN i.number REGEXP '^-?[0-9]+$' THEN 0 ELSE 1 END ASC,
             CASE WHEN i.number REGEXP '^-?[0-9]+$' THEN CAST(i.number AS SIGNED) ELSE 0 END ASC,
             i.number ASC
    ";
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }

    $list = [];
    while ($row = $result->fetch_assoc()) {
        $list[] = [
            'id'         => (int) $row['id'],
            'number'     => $row['number'],
            'seriesId'   => (int) $row['series_id'],
            'seriesName' => $row['series_name'] ?? '',
            'titleId'    => (int) $row['title_id'],
            'titleName'  => $row['title_name'] ?? '',
        ];
    }

    return json_encode(['issues' => $list]);
}

function grabIssueRaw($id)
{
    $issue = new ComicDB_Issue($id);
    $issue->restore();
    return json_encode([
        'id'            => $issue->id(),
        'seriesId'      => $issue->seriesId(),
        'number'        => $issue->number(),
        'sort'          => $issue->sort(),
        'printRun'      => $issue->printRun(),
        'quantity'      => $issue->quantity(),
        'coverDate'     => $issue->coverdate(),
        'location'      => $issue->location(),
        'type'          => $issue->type(),
        'status'        => $issue->status(),
        'condition'     => $issue->condition(),
        'coverPrice'    => $issue->coverPrice(),
        'purchasePrice' => $issue->purchasePrice(),
        'purchaseDate'  => $issue->purchasedate(),
        'guideValue'    => $issue->guideValue(),
        'guide'         => $issue->guide(),
        'issueValue'    => $issue->issueValue(),
        'comments'      => $issue->comments(),
        'storyTitle'    => $issue->storyTitle(),
    ]);
}

// Grab a Publisher by ID
function grabPublisher($id)
{
    $publisher = new ComicDB_Publisher();
    $publisher->id($id);
    $publisher->restore();
    return json_encode([
        'id'   => $publisher->id(),
        'name' => $publisher->name(),
    ]);
}

// Grab all Publishers with title count
function grabPublishers()
{
    $db    = ComicDB_DB::db();
    $query = "
      SELECT p.id, p.name, COUNT(DISTINCT s.title) AS title_count
        FROM publisher p
   LEFT JOIN series s ON s.publisher_id = p.id
    GROUP BY p.id, p.name
    ORDER BY p.name ASC
    ";
    $result = $db->query($query);
    $list   = [];
    while ($row = $result->fetch_assoc()) {
        $list[] = [
            'id'          => (int) $row['id'],
            'name'        => $row['name'],
            'title_count' => (int) $row['title_count'],
        ];
    }
    return json_encode(['publishers' => $list]);
}

function grabDashboard()
{
    $db = ComicDB_DB::db();
    ensureSeriesTotalSchema($db);

    $totalsQuery = "
      SELECT (SELECT COUNT(*) FROM publisher) AS publishers,
             (SELECT COUNT(*) FROM titles) AS titles,
             (SELECT COUNT(*) FROM series) AS series,
             (SELECT COUNT(*) FROM issues) AS issues_owned
    ";
    $totalsResult = $db->query($totalsQuery);
    if (! $totalsResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $totalsRow = $totalsResult->fetch_assoc();

    $valuesQuery = "
      SELECT COALESCE(SUM(issue_value), 0) AS issue_value,
             COALESCE(SUM(purchase_price), 0) AS purchase_price,
             COALESCE(SUM(cover_price), 0) AS cover_price
        FROM issues
    ";
    $valuesResult = $db->query($valuesQuery);
    if (! $valuesResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $valuesRow = $valuesResult->fetch_assoc();

    $statusQuery = "
      SELECT status, COUNT(*) AS total
        FROM issues
    GROUP BY status
    ";
    $statusResult = $db->query($statusQuery);
    if (! $statusResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $statusCounts = [0 => 0, 1 => 0, 2 => 0];
    while ($row = $statusResult->fetch_assoc()) {
        $status = isset($row['status']) ? (int) $row['status'] : -1;
        if (array_key_exists($status, $statusCounts)) {
            $statusCounts[$status] = (int) $row['total'];
        }
    }
    $statusBreakdown = [
        ['status' => 'Collected', 'count' => $statusCounts[0]],
        ['status' => 'For Sale', 'count' => $statusCounts[1]],
        ['status' => 'Wish List', 'count' => $statusCounts[2]],
    ];

    $topPublishersQuery = "
      SELECT p.name AS name, COUNT(i.id) AS issue_count
        FROM series s
        JOIN publisher p ON p.id = s.publisher_id
   LEFT JOIN issues i ON i.series = s.id
    GROUP BY p.id, p.name
    ORDER BY issue_count DESC, p.name ASC
       LIMIT 5
    ";
    $topPublishersResult = $db->query($topPublishersQuery);
    if (! $topPublishersResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $topPublishers = [];
    while ($row = $topPublishersResult->fetch_assoc()) {
        $topPublishers[] = [
            'name'       => $row['name'] ?? 'Unknown',
            'issueCount' => (int) $row['issue_count'],
        ];
    }

    $topTitlesQuery = "
      SELECT t.name, COUNT(i.id) AS issue_count
        FROM titles t
   LEFT JOIN series s ON s.title = t.id
   LEFT JOIN issues i ON i.series = s.id
    GROUP BY t.id, t.name
    ORDER BY issue_count DESC, t.name ASC
       LIMIT 5
    ";
    $topTitlesResult = $db->query($topTitlesQuery);
    if (! $topTitlesResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $topTitles = [];
    while ($row = $topTitlesResult->fetch_assoc()) {
        $topTitles[] = [
            'name'       => $row['name'] ?? 'Unknown',
            'issueCount' => (int) $row['issue_count'],
        ];
    }

    $missingQuery = "
      SELECT COALESCE(SUM(GREATEST(expected_total - issue_count, 0)), 0) AS estimated_missing_issues,
             COALESCE(SUM(CASE WHEN expected_total > issue_count THEN 1 ELSE 0 END), 0) AS series_with_gaps
        FROM (
              SELECT s.id,
                     CASE
                         WHEN s.total_issues IS NOT NULL
                          AND s.total_issues > 0
                         THEN s.total_issues
                         WHEN s.first_issue IS NOT NULL
                          AND s.final_issue IS NOT NULL
                          AND s.final_issue >= s.first_issue
                         THEN (s.final_issue - s.first_issue + 1)
                         ELSE 0
                     END AS expected_total,
                     COUNT(DISTINCT CASE WHEN i.sort IS NOT NULL AND i.sort > 0 THEN CONCAT('S', i.sort) ELSE CONCAT('I', i.id) END) AS issue_count
                FROM series s
           LEFT JOIN issues i ON i.series = s.id
            GROUP BY s.id, s.total_issues, s.first_issue, s.final_issue
              ) expected
    ";
    $missingResult = $db->query($missingQuery);
    if (! $missingResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $missingRow = $missingResult->fetch_assoc();

    return json_encode([
        'totals'          => [
            'publishers'  => (int) $totalsRow['publishers'],
            'titles'      => (int) $totalsRow['titles'],
            'series'      => (int) $totalsRow['series'],
            'issuesOwned' => (int) $totalsRow['issues_owned'],
        ],
        'values'          => [
            'issueValue'    => (float) $valuesRow['issue_value'],
            'purchasePrice' => (float) $valuesRow['purchase_price'],
            'coverPrice'    => (float) $valuesRow['cover_price'],
        ],
        'statusBreakdown' => $statusBreakdown,
        'topPublishers'   => $topPublishers,
        'topTitles'       => $topTitles,
        'missing'         => [
            'estimatedMissingIssues' => (int) $missingRow['estimated_missing_issues'],
            'seriesWithGaps'         => (int) $missingRow['series_with_gaps'],
        ],
    ]);
}

function grabSeriesTypes()
{
    $typesList = new ComicDB_SeriesTypes();
    $types     = $typesList->getAll();
    $list      = [];
    foreach ($types as $type) {
        $list[] = [
            'id'   => (int) $type->id(),
            'name' => $type->name(),
        ];
    }
    return json_encode(['series_types' => $list]);
}

function createPublisher($dataJson)
{
    $data = json_decode($dataJson, true);
    if (! isset($data['name']) || trim($data['name']) === '') {
        return json_encode(['error' => 'Publisher name is required.']);
    }
    $publisher = new ComicDB_Publisher();
    $publisher->name($data['name']);
    $publisher->save();
    return json_encode(['id' => $publisher->id(), 'name' => $publisher->name()]);
}

function updatePublisher($id, $dataJson)
{
    $data      = json_decode($dataJson, true);
    $publisher = new ComicDB_Publisher();
    $publisher->id($id);
    $publisher->restore();
    $oldName = $publisher->name();

    if (isset($data['name'])) {
        if (trim($data['name']) === '') {
            return json_encode(['error' => 'Publisher name is required.']);
        }
        $publisher->name($data['name']);
    }

    $publisher->save();

    return json_encode(['id' => $publisher->id(), 'name' => $publisher->name()]);
}

function deletePublisher($id)
{
    $publisher = new ComicDB_Publisher();
    $publisher->id($id);
    $publisher->restore();
    $name        = $publisher->name();
    $db          = ComicDB_DB::db();
    $nameEscaped = $db->real_escape_string($name);
    $countQuery  = "
      SELECT COUNT(*) AS series_count
        FROM series
       WHERE publisher_id = $id
    ";
    $countResult = $db->query($countQuery);
    if (! $countResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $row         = $countResult->fetch_assoc();
    $seriesCount = (int) $row['series_count'];
    if ($seriesCount > 0) {
        return json_encode([
            'deleted' => false,
            'id'      => (int) $id,
            'error'   => "Cannot delete publisher in use by $seriesCount series.",
        ]);
    }

    $publisher->remove();
    return json_encode(['deleted' => true, 'id' => (int) $id]);
}

function buildSeriesGridPayload($id)
{
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $series = new ComicDB_Series($id);
    $series->restore();

    $firstIssue = $series->firstIssue();
    $finalIssue = $series->finalIssue();
    $grid       = new Grid($series);
    $gridData   = $grid->displayGrid();

    return [
        'seriesId'    => (int) $id,
        'firstIssue'  => is_numeric($firstIssue) ? (int) $firstIssue : null,
        'finalIssue'  => is_numeric($finalIssue) ? (int) $finalIssue : null,
        'totalIssues' => is_numeric($series->totalIssues()) ? (int) $series->totalIssues() : 0,
        'gridable'    => count($gridData) > 0,
        'issues'      => $gridData,
    ];
}

function grabSeriesGrid($id)
{
    return json_encode(buildSeriesGridPayload($id));
}

function grabSeriesMissing($id)
{
    $seriesId = (int) $id;
    $db       = ComicDB_DB::db();
    ensureSeriesTotalSchema($db);

    $seriesQuery  = "SELECT total_issues FROM series WHERE id=$seriesId LIMIT 1";
    $seriesResult = $db->query($seriesQuery);
    if (! $seriesResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $seriesRow = $seriesResult->fetch_assoc();
    if (! $seriesRow) {
        return json_encode([
            'seriesId'     => $seriesId,
            'totalIssues'  => 0,
            'ownedSlots'   => 0,
            'missingCount' => 0,
            'missingSlots' => [],
        ]);
    }

    $totalIssues = isset($seriesRow['total_issues']) ? (int) $seriesRow['total_issues'] : 0;
    if ($totalIssues <= 0) {
        return json_encode([
            'seriesId'     => $seriesId,
            'totalIssues'  => 0,
            'ownedSlots'   => 0,
            'missingCount' => 0,
            'missingSlots' => [],
        ]);
    }

    $issuesQuery  = "SELECT number, sort FROM issues WHERE series=$seriesId";
    $issuesResult = $db->query($issuesQuery);
    if (! $issuesResult) {
        die('There was an error running the query [' . $db->error . ']');
    }

    $occupied = [];
    while ($row = $issuesResult->fetch_assoc()) {
        $slot = parseSeriesSlotFromSortValue($row['sort'] ?? null);
        if ($slot === null) {
            $slot = parseSeriesSlotFromIssueNumber($row['number'] ?? null);
        }
        if ($slot === null || $slot < 1 || $slot > $totalIssues) {
            continue;
        }
        $occupied[$slot] = true;
    }

    $missingSlots = [];
    for ($slot = 1; $slot <= $totalIssues; $slot++) {
        if (! isset($occupied[$slot])) {
            $missingSlots[] = ['slot' => $slot];
        }
    }

    return json_encode([
        'seriesId'     => $seriesId,
        'totalIssues'  => $totalIssues,
        'ownedSlots'   => count($occupied),
        'missingCount' => count($missingSlots),
        'missingSlots' => $missingSlots,
    ]);
}

function grabIssues($id)
{
    $payload = buildSeriesGridPayload($id);
    return json_encode($payload['issues']);
}

function grabIssue($id)
{
    $issueArray = [];
    $issue      = new ComicDB_Issue($id);
    $issue->restore();

    $issueArray['number']          = htmlspecialchars($issue->number() ?? '');
    $issueArray['printrun']        = htmlspecialchars($issue->printRun() ?? '');
    $issueArray['quantity']        = $issue->quantity();
    $issueArray['location']        = htmlspecialchars($issue->location() ?? '');
    $issueArray['type']            = htmlspecialchars($issue->type() ?? '');
    $issueArray['condition']       = htmlspecialchars($issue->condition() ?? '');
    $issueArray['coverprice']      = $issue->coverPrice();
    $issueArray['purchaseprice']   = $issue->purchasePrice();
    $issueArray['priceguidevalue'] = $issue->guideValue();
    $issueArray['issuevalue']      = $issue->issueValue();
    $issueArray['priceguide']      = htmlspecialchars($issue->guide() ?? '');
    $issueArray['comments']        = htmlspecialchars($issue->comments() ?? '');
    $issueArray['storytitle']      = htmlspecialchars($issue->storyTitle() ?? '');
    //$issueArray['image'] = "";

    $status = $issue->status();
    if ($status == 0) {
        $status = "Collected";
    } else if ($status == 1) {
        $status = "For Sale";
    } else if ($status == 2) {
        $status = "Wish List";
    } else {
        $status = "Unknown";
    }
    $issueArray['status']       = $status;
    $purchasedate               = $issue->purchasedate();
    $issueArray['purchasedate'] = $purchasedate !== null ? date("M d, Y", (int) $purchasedate) : '';
    $coverdate                  = $issue->coverdate();
    $issueArray['coverdate']    = $coverdate !== null ? date("M Y", (int) $coverdate) : '';

    return json_encode($issueArray);
}
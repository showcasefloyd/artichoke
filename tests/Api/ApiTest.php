<?php
namespace Tests\Api;

use Tests\ComicDBTestCase;

/**
 * Integration tests for the api.php callable functions.
 *
 * api.php uses `require_once('./lib/global.inc')` which is relative to the
 * app/ directory, so we chdir there before including it. Top-level echo output
 * is captured with output buffering and discarded.
 */
class ApiTest extends ComicDBTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->includeApi();
    }

    private static bool $apiLoaded = false;

    private function includeApi(): void
    {
        if (self::$apiLoaded) {
            return;
        }
        $orig = getcwd();
        chdir(__DIR__ . '/../../app');
        ob_start();
        require_once __DIR__ . '/../../app/api.php';
        ob_end_clean();
        chdir($orig);
        self::$apiLoaded = true;
    }

    // ------------------------------------------------------------------ Title

    public function testCreateTitleReturnsIdAndName(): void
    {
        $json   = createTitle('API Test Title');
        $result = json_decode($json, true);

        $this->assertArrayHasKey('id', $result);
        $this->assertGreaterThan(0, $result['id']);
        $this->assertSame('API Test Title', $result['name']);
    }

    public function testUpdateTitleChangesName(): void
    {
        $created = json_decode(createTitle('Before API Update'), true);
        $json    = updateTitle($created['id'], 'After API Update');
        $result  = json_decode($json, true);

        $this->assertSame('After API Update', $result['name']);
        $this->assertSame($created['id'], $result['id']);
    }

    public function testDeleteTitleReturnsDeletedTrue(): void
    {
        $created = json_decode(createTitle('Title To API Delete'), true);
        $json    = deleteTitle($created['id']);
        $result  = json_decode($json, true);

        $this->assertTrue($result['deleted']);
        $this->assertEquals($created['id'], $result['id']);
    }

    // ------------------------------------------------------------------ Series

    public function testCreateSeriesReturnsIdAndName(): void
    {
        $title   = json_decode(createTitle('Series Parent Title'), true);
        $payload = json_encode([
            'titleId'   => $title['id'],
            'name'      => 'API Series',
            'publisher' => 'API Pub',
        ]);

        $json   = createSeries($payload);
        $result = json_decode($json, true);

        $this->assertArrayHasKey('id', $result);
        $this->assertGreaterThan(0, $result['id']);
        $this->assertSame('API Series', $result['name']);
    }

    public function testUpdateSeriesChangesName(): void
    {
        $title   = json_decode(createTitle('Series Update Title'), true);
        $created = json_decode(createSeries(json_encode([
            'titleId'   => $title['id'],
            'name'      => 'Before Series Update',
            'publisher' => 'Pub',
        ])), true);

        $json   = updateSeries($created['id'], json_encode(['name' => 'After Series Update']));
        $result = json_decode($json, true);

        $this->assertSame('After Series Update', $result['name']);
    }

    public function testSeriesTotalIssuesPersistsInApiPayloads(): void
    {
        $title = json_decode(createTitle('Series Total Parent Title'), true);
        $created = json_decode(createSeries(json_encode([
            'titleId' => $title['id'],
            'name' => 'Series Total API',
            'publisher' => 'Total Pub',
            'totalIssues' => 48,
        ])), true);

        $series = json_decode(grabSerieById($created['id']), true);
        $this->assertSame('48', (string) $series['totalIssues']);

        updateSeries($created['id'], json_encode(['totalIssues' => 52]));
        $updated = json_decode(grabSerieById($created['id']), true);
        $this->assertSame('52', (string) $updated['totalIssues']);
    }

    public function testDeleteSeriesReturnsDeletedTrue(): void
    {
        $title   = json_decode(createTitle('Series Delete Title'), true);
        $created = json_decode(createSeries(json_encode([
            'titleId'   => $title['id'],
            'name'      => 'Series To Delete',
            'publisher' => 'Del Pub',
        ])), true);

        $json   = deleteSeries($created['id']);
        $result = json_decode($json, true);

        $this->assertTrue($result['deleted']);
        $this->assertEquals($created['id'], $result['id']);
    }

    // ------------------------------------------------------------------ Issue

    public function testCreateIssueReturnsIdAndNumber(): void
    {
        $title  = json_decode(createTitle('Issue Parent Title'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId'   => $title['id'],
            'name'      => 'Issue Parent Series',
            'publisher' => 'Iss Pub',
        ])), true);

        $json = createIssue(json_encode([
            'seriesId' => $series['id'],
            'number'   => '1',
        ]));
        $result = json_decode($json, true);

        $this->assertArrayHasKey('id', $result);
        $this->assertGreaterThan(0, $result['id']);
        $this->assertSame('1', $result['number']);
    }

    public function testUpdateIssueChangesNumber(): void
    {
        $title  = json_decode(createTitle('Issue Update Title'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId'   => $title['id'],
            'name'      => 'Issue Update Series',
            'publisher' => 'Upd Pub',
        ])), true);
        $created = json_decode(createIssue(json_encode([
            'seriesId' => $series['id'],
            'number'   => '5',
        ])), true);

        $json   = updateIssue($created['id'], json_encode(['number' => '6']));
        $result = json_decode($json, true);

        $this->assertSame('6', $result['number']);
    }

    public function testDeleteIssueReturnsDeletedTrue(): void
    {
        $title  = json_decode(createTitle('Issue Delete Title'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId'   => $title['id'],
            'name'      => 'Issue Delete Series',
            'publisher' => 'Iss Pub',
        ])), true);
        $created = json_decode(createIssue(json_encode([
            'seriesId' => $series['id'],
            'number'   => '99',
        ])), true);

        $json   = deleteIssue($created['id']);
        $result = json_decode($json, true);

        $this->assertTrue($result['deleted']);
        $this->assertEquals($created['id'], $result['id']);
    }

    public function testIssueRawIncludesStoryTitle(): void
    {
        $title  = json_decode(createTitle('Issue Story Title Parent'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId'   => $title['id'],
            'name'      => 'Issue Story Title Series',
            'publisher' => 'Story Pub',
        ])), true);

        $created = json_decode(createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '12',
            'storyTitle' => 'The Last Story',
        ])), true);

        $raw = json_decode(grabIssueRaw($created['id']), true);
        $this->assertSame('The Last Story', $raw['storyTitle']);
    }

    public function testCommitCsvImportDryRunLogsSkippedRows(): void
    {
        $csv = "Series,Issue,Full Title,Publisher\nAction Comics,,A Story,DC\nAction Comics,1,Another Story,DC\n";
        $result = json_decode(commitCsvImport(json_encode([
            'csvText' => $csv,
            'delimiter' => ',',
            'hasHeader' => true,
            'mode' => 'dry-run',
        ])), true);

        $this->assertArrayHasKey('runId', $result);
        $this->assertSame(2, $result['summary']['rowCount']);
        $this->assertSame(1, $result['summary']['errorRows']);
        $this->assertSame(1, $result['loggedSkippedRows']);

        $skipped = json_decode(grabCsvImportSkippedRows($result['runId'], '10'), true);
        $this->assertSame(1, $skipped['count']);
        $this->assertStringContainsString('issueNumber', $skipped['rows'][0]['errors']);
    }

    public function testGrabCsvImportRunsReturnsRunHistory(): void
    {
        $csv = "Series,Issue,Full Title,Publisher\nAction Comics,,A Story,DC\n";
        $result = json_decode(commitCsvImport(json_encode([
            'csvText' => $csv,
            'delimiter' => ',',
            'hasHeader' => true,
            'mode' => 'dry-run',
        ])), true);

        $history = json_decode(grabCsvImportRuns('5'), true);
        $this->assertGreaterThan(0, $history['count']);
        $runIds = array_map(fn($run) => $run['runId'], $history['runs']);
        $this->assertContains($result['runId'], $runIds);
    }

    public function testGrabSeriesGridReturnsOwnedAndMissingSlots(): void
    {
        $title  = json_decode(createTitle('Grid Parent Title'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId' => $title['id'],
            'name' => 'Grid Parent Series',
            'publisher' => 'Grid Pub',
            'firstIssue' => 1,
            'finalIssue' => 4,
        ])), true);

        $ownedOne = json_decode(createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '1',
        ])), true);
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '2A',
        ]));
        json_decode(createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '3',
        ])), true);

        $json = grabSeriesGrid($series['id']);
        $result = json_decode($json, true);

        $this->assertTrue($result['gridable']);
        $this->assertSame(1, $result['firstIssue']);
        $this->assertSame(4, $result['finalIssue']);
        $this->assertCount(4, $result['issues']);
        $this->assertSame(1, $result['issues'][0]['issue']);
        $this->assertSame('Y', $result['issues'][0]['own']);
        $this->assertEquals($ownedOne['id'], $result['issues'][0]['issue_id']);
        $this->assertSame('N', $result['issues'][1]['own']);
        $this->assertSame(0, $result['issues'][1]['issue_id']);
    }

    public function testGrabSeriesGridReturnsNotGridableForSingleIssueRun(): void
    {
        $title  = json_decode(createTitle('Single Grid Title'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId' => $title['id'],
            'name' => 'Single Grid Series',
            'publisher' => 'Grid Pub',
            'firstIssue' => 1,
            'finalIssue' => 1,
        ])), true);

        $json = grabSeriesGrid($series['id']);
        $result = json_decode($json, true);

        $this->assertFalse($result['gridable']);
        $this->assertSame([], $result['issues']);
    }

    public function testGrabSeriesGridSupportsIssueZeroStart(): void
    {
        $title  = json_decode(createTitle('Zero Start Title'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId' => $title['id'],
            'name' => 'Zero Start Series',
            'publisher' => 'Grid Pub',
            'firstIssue' => 0,
            'finalIssue' => 2,
        ])), true);

        $ownedZero = json_decode(createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '0',
        ])), true);

        $json = grabSeriesGrid($series['id']);
        $result = json_decode($json, true);

        $this->assertTrue($result['gridable']);
        $this->assertSame(0, $result['firstIssue']);
        $this->assertSame(2, $result['finalIssue']);
        $this->assertCount(3, $result['issues']);
        $this->assertSame(0, $result['issues'][0]['issue']);
        $this->assertSame('Y', $result['issues'][0]['own']);
        $this->assertEquals($ownedZero['id'], $result['issues'][0]['issue_id']);
    }

    public function testGrabSeriesGridUsesSortOrderWhenTotalIssuesIsSet(): void
    {
        $title  = json_decode(createTitle('Sort Grid Title'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId' => $title['id'],
            'name' => 'Sort Grid Series',
            'publisher' => 'Grid Pub',
            'totalIssues' => 4,
        ])), true);

        $firstVariant = json_decode(createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '5A',
            'sort' => 1,
        ])), true);

        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '5B',
            'sort' => 1,
        ]));

        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '-1',
            'sort' => 2,
        ]));

        $json = grabSeriesGrid($series['id']);
        $result = json_decode($json, true);

        $this->assertTrue($result['gridable']);
        $this->assertSame(4, $result['totalIssues']);
        $this->assertCount(4, $result['issues']);
        $this->assertSame('Y', $result['issues'][0]['own']);
        $this->assertEquals($firstVariant['id'], $result['issues'][0]['issue_id']);
        $this->assertSame('Y', $result['issues'][1]['own']);
        $this->assertSame('N', $result['issues'][2]['own']);
    }

    public function testGrabIssuesListOrdersBySortThenFallbackNumber(): void
    {
        $title  = json_decode(createTitle('Issues Sort Parent'), true);
        $series = json_decode(createSeries(json_encode([
            'titleId' => $title['id'],
            'name' => 'Issues Sort Series',
            'publisher' => 'Sort Pub',
        ])), true);

        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '14',
        ]));
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '18',
        ]));
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '1A',
            'sort' => 1,
        ]));
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '2A',
            'sort' => 2,
        ]));
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '3',
        ]));
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '4',
        ]));
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '5',
        ]));

        $json = grabIssuesList(json_encode(['seriesId' => $series['id']]));
        $result = json_decode($json, true);
        $numbers = array_map(fn($row) => $row['number'], $result['issues']);

        $this->assertSame(['1A', '2A', '3', '4', '5', '14', '18'], $numbers);
    }
}

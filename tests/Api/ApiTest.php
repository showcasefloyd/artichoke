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

    // ------------------------------------------------------------------ Series

    public function testCreateSeriesReturnsIdAndName(): void
    {
        $pub     = json_decode(createPublisher(json_encode(['name' => 'API Pub'])), true);
        $payload = json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'API Series',
        ]);

        $json   = createSeries($payload);
        $result = json_decode($json, true);

        $this->assertArrayHasKey('id', $result);
        $this->assertGreaterThan(0, $result['id']);
        $this->assertSame('API Series', $result['name']);
    }

    public function testUpdateSeriesChangesName(): void
    {
        $pub     = json_decode(createPublisher(json_encode(['name' => 'Update Pub'])), true);
        $created = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Before Series Update',
        ])), true);

        $json   = updateSeries($created['id'], json_encode(['name' => 'After Series Update']));
        $result = json_decode($json, true);

        $this->assertSame('After Series Update', $result['name']);
    }

    public function testSeriesTotalIssuesPersistsInApiPayloads(): void
    {
        $pub     = json_decode(createPublisher(json_encode(['name' => 'Total Pub'])), true);
        $created = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Series Total API',
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
        $pub     = json_decode(createPublisher(json_encode(['name' => 'Del Pub'])), true);
        $created = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Series To Delete',
        ])), true);

        $json   = deleteSeries($created['id']);
        $result = json_decode($json, true);

        $this->assertTrue($result['deleted']);
        $this->assertEquals($created['id'], $result['id']);
    }

    // ------------------------------------------------------------------ Issue

    public function testCreateIssueReturnsIdAndNumber(): void
    {
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Iss Pub'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Issue Parent Series',
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
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Upd Pub'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Issue Update Series',
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
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Iss Pub 2'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Issue Delete Series',
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
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Story Pub'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Issue Story Title Series',
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
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Grid Pub'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Grid Parent Series',
            'firstIssue'  => 1,
            'finalIssue'  => 4,
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
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Grid Pub 2'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Single Grid Series',
            'firstIssue'  => 1,
            'finalIssue'  => 1,
        ])), true);

        $json = grabSeriesGrid($series['id']);
        $result = json_decode($json, true);

        $this->assertFalse($result['gridable']);
        $this->assertSame([], $result['issues']);
    }

    public function testGrabSeriesGridSupportsIssueZeroStart(): void
    {
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Grid Pub 3'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Zero Start Series',
            'firstIssue'  => 0,
            'finalIssue'  => 2,
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
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Grid Pub 4'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Sort Grid Series',
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

    public function testGrabSeriesMissingReturnsUnownedSlots(): void
    {
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Missing Pub'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Missing Slots Series',
            'totalIssues' => 6,
        ])), true);

        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '1A',
            'sort' => 1,
        ]));
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '3',
        ]));
        createIssue(json_encode([
            'seriesId' => $series['id'],
            'number' => '5',
        ]));

        $json = grabSeriesMissing($series['id']);
        $result = json_decode($json, true);

        $this->assertSame(6, $result['totalIssues']);
        $this->assertSame(3, $result['ownedSlots']);
        $this->assertSame(3, $result['missingCount']);
        $slots = array_map(fn($row) => (int) $row['slot'], $result['missingSlots']);
        $this->assertSame([2, 4, 6], $slots);
    }

    public function testGrabIssuesListOrdersBySortThenFallbackNumber(): void
    {
        $pub    = json_decode(createPublisher(json_encode(['name' => 'Sort Pub'])), true);
        $series = json_decode(createSeries(json_encode([
            'publisherId' => $pub['id'],
            'name'        => 'Issues Sort Series',
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

<?php
require_once './lib/global.inc';
include_once "ComicDB/Titles.php";
include_once "ComicDB/Title.php";
include_once "ComicDB/Serieses.php";
include_once "ComicDB/Issue.php";
include_once "ComicDB/Publisher.php";
include_once "ComicDB/Publishers.php";
include_once "ComicDB/SeriesTypes.php";
include_once "./lib/ComicVine.php";

function csvImportCanonicalFields()
{
    return [
        ['key' => 'titleName', 'label' => 'Title Name (Franchise)'],
        ['key' => 'seriesName', 'label' => 'Series Name', 'required' => true],
        ['key' => 'issueNumber', 'label' => 'Issue Number', 'required' => true],
        ['key' => 'storyTitle', 'label' => 'Story Title'],
        ['key' => 'publisher', 'label' => 'Publisher'],
        ['key' => 'volume', 'label' => 'Volume'],
        ['key' => 'startYear', 'label' => 'Start Year'],
        ['key' => 'seriesType', 'label' => 'Series Type'],
        ['key' => 'printRun', 'label' => 'Print Run'],
        ['key' => 'quantity', 'label' => 'Quantity'],
        ['key' => 'coverDate', 'label' => 'Cover Date'],
        ['key' => 'purchaseDate', 'label' => 'Purchase Date'],
        ['key' => 'coverPrice', 'label' => 'Cover Price'],
        ['key' => 'purchasePrice', 'label' => 'Purchase Price'],
        ['key' => 'status', 'label' => 'Status'],
        ['key' => 'condition', 'label' => 'Condition'],
        ['key' => 'location', 'label' => 'Location'],
        ['key' => 'guide', 'label' => 'Guide'],
        ['key' => 'guideValue', 'label' => 'Guide Value'],
        ['key' => 'issueValue', 'label' => 'Issue Value'],
        ['key' => 'comments', 'label' => 'Comments'],
    ];
}

function normalizeCsvImportKey($value)
{
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
    $value = preg_replace('/[^a-z0-9]+/', '_', $value);
    return trim($value, '_');
}

function resolveCsvImportDelimiter($delimiter)
{
    if (!isset($delimiter) || $delimiter === '') {
        return ',';
    }
    if ($delimiter === '\\t') {
        return "\t";
    }
    return substr((string) $delimiter, 0, 1);
}

function guessCsvImportField($header)
{
    $normalized = normalizeCsvImportKey($header);
    $exactMap = [
        'titlename' => 'titleName',
        'title_name' => 'titleName',
        'full_title' => 'storyTitle',
        'story_title' => 'storyTitle',
        'seriesname' => 'seriesName',
        'series_name' => 'seriesName',
        'issuenumber' => 'issueNumber',
        'issue_number' => 'issueNumber',
        'publisher' => 'publisher',
        'volume' => 'volume',
        'startyear' => 'startYear',
        'start_year' => 'startYear',
        'seriestype' => 'seriesType',
        'series_type' => 'seriesType',
        'printrun' => 'printRun',
        'print_run' => 'printRun',
        'quantity' => 'quantity',
        'coverdate' => 'coverDate',
        'cover_date' => 'coverDate',
        'purchasedate' => 'purchaseDate',
        'purchase_date' => 'purchaseDate',
        'coverprice' => 'coverPrice',
        'cover_price' => 'coverPrice',
        'purchaseprice' => 'purchasePrice',
        'purchase_price' => 'purchasePrice',
        'status' => 'status',
        'condition' => 'condition',
        'bkcondition' => 'condition',
        'location' => 'location',
        'guide' => 'guide',
        'guidevalue' => 'guideValue',
        'guide_value' => 'guideValue',
        'issuevalue' => 'issueValue',
        'issue_value' => 'issueValue',
        'comments' => 'comments',
    ];
    if (isset($exactMap[$normalized])) {
        return ['field' => $exactMap[$normalized], 'confidence' => 'exact'];
    }

    $aliasMap = [
        'title' => 'titleName',
        'comic_title' => 'titleName',
        'story' => 'storyTitle',
        'series' => 'seriesName',
        'run' => 'seriesName',
        'issue' => 'issueNumber',
        'number' => 'issueNumber',
        'issue_no' => 'issueNumber',
        'variant_description' => 'comments',
        'varient_description' => 'comments',
        'series_volume' => 'volume',
        'year' => 'startYear',
        'series_year' => 'startYear',
        'type' => 'seriesType',
        'series_kind' => 'seriesType',
        'printing' => 'printRun',
        'qty' => 'quantity',
        'on_hand' => 'quantity',
        'cover' => 'coverDate',
        'cover_month' => 'coverDate',
        'purchased' => 'purchaseDate',
        'cost' => 'purchasePrice',
        'price' => 'coverPrice',
        'grade' => 'condition',
        'storage_box' => 'location',
        'notes' => 'comments',
        'comment' => 'comments',
    ];
    if (isset($aliasMap[$normalized])) {
        return ['field' => $aliasMap[$normalized], 'confidence' => 'alias'];
    }

    return ['field' => null, 'confidence' => 'none'];
}

function csvImportDeriveTitleNameFromSeriesName($seriesName)
{
    $seriesName = trim((string) $seriesName);
    if ($seriesName === '') {
        return null;
    }

    $derived = preg_replace('/\s*[,(\-]?\s*vol(?:ume)?\.?\s*\d+[a-z]?\s*\)?\s*$/i', '', $seriesName);
    $derived = trim((string) $derived);
    if ($derived === '') {
        return $seriesName;
    }
    return $derived;
}

function csvImportParseInteger($value)
{
    $raw = trim((string) $value);
    if ($raw === '') {
        return ['value' => null, 'error' => null];
    }
    if (!preg_match('/^-?\d+$/', $raw)) {
        return ['value' => null, 'error' => 'Expected integer'];
    }
    return ['value' => (int) $raw, 'error' => null];
}

function csvImportParseDecimal($value)
{
    $raw = trim((string) $value);
    if ($raw === '') {
        return ['value' => null, 'error' => null];
    }
    $normalized = str_replace([',', '$'], ['.', ''], $raw);
    if (!is_numeric($normalized)) {
        return ['value' => null, 'error' => 'Expected decimal number'];
    }
    return ['value' => number_format((float) $normalized, 2, '.', ''), 'error' => null];
}

function csvImportParseDate($value)
{
    $raw = trim((string) $value);
    if ($raw === '') {
        return ['value' => null, 'error' => null];
    }
    $timestamp = strtotime($raw);
    if ($timestamp === false) {
        return ['value' => null, 'error' => 'Expected recognizable date'];
    }
    return ['value' => date('Y-m-d', $timestamp), 'error' => null];
}

function csvImportParseStatus($value)
{
    $raw = trim((string) $value);
    if ($raw === '') {
        return ['value' => null, 'error' => null];
    }
    $normalized = normalizeCsvImportKey($raw);
    $map = [
        '0' => 0,
        '1' => 1,
        '2' => 2,
        'collected' => 0,
        'for_sale' => 1,
        'forsale' => 1,
        'wish_list' => 2,
        'wishlist' => 2,
    ];
    if (!isset($map[$normalized])) {
        return ['value' => null, 'error' => "Unknown status '$raw'"];
    }
    return ['value' => $map[$normalized], 'error' => null];
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

function parseSeriesSlotFromSortValue($value)
{
    if (!isset($value)) {
        return null;
    }
    $normalized = trim((string) $value);
    if ($normalized === '' || !preg_match('/^-?\d+$/', $normalized)) {
        return null;
    }
    $slot = (int) $normalized;
    return $slot > 0 ? $slot : null;
}

function parseSeriesSlotFromIssueNumber($value)
{
    if (!isset($value)) {
        return null;
    }
    $normalized = trim((string) $value);
    if ($normalized === '' || !preg_match('/^-?\d+$/', $normalized)) {
        return null;
    }
    $slot = (int) $normalized;
    return $slot > 0 ? $slot : null;
}

function csvImportCanonicalFieldKeys()
{
    $keys = [];
    foreach (csvImportCanonicalFields() as $field) {
        $keys[$field['key']] = true;
    }
    return $keys;
}

function csvImportResolveMapping($headers, $mappingSuggestions, $mappingInput, &$warnings)
{
    $resolvedMapping = [];
    $mappedFieldKeys = [];
    $fieldKeys = csvImportCanonicalFieldKeys();

    if (is_array($mappingInput)) {
        foreach ($headers as $header) {
            if (!array_key_exists($header, $mappingInput)) {
                continue;
            }
            $field = trim((string) $mappingInput[$header]);
            if ($field === '') {
                continue;
            }
            if (!isset($fieldKeys[$field])) {
                $warnings[] = "Unknown mapped field '$field' for column '$header'.";
                continue;
            }
            if (isset($mappedFieldKeys[$field])) {
                $warnings[] = "Field '$field' was mapped more than once. Keeping first mapped column.";
                continue;
            }
            $mappedFieldKeys[$field] = true;
            $resolvedMapping[] = [
                'field' => $field,
                'column' => $header,
            ];
        }
    }

    foreach ($mappingSuggestions as $suggestion) {
        if (!isset($suggestion['suggestedField']) || $suggestion['suggestedField'] === null) {
            continue;
        }
        $field = $suggestion['suggestedField'];
        if (isset($mappedFieldKeys[$field])) {
            continue;
        }
        $mappedFieldKeys[$field] = true;
        $resolvedMapping[] = [
            'field' => $field,
            'column' => $suggestion['column'],
        ];
    }

    return $resolvedMapping;
}

function csvImportBuildPreviewPayload($data, $includeRows = false)
{
    if (!is_array($data)) {
        return ['error' => 'Invalid request payload.'];
    }

    $csvText = isset($data['csvText']) ? (string) $data['csvText'] : '';
    if (trim($csvText) === '') {
        return ['error' => 'CSV text is required.'];
    }

    $delimiter = resolveCsvImportDelimiter($data['delimiter'] ?? ',');
    $hasHeader = !isset($data['hasHeader']) || (bool) $data['hasHeader'];
    $warnings = [];

    $stream = fopen('php://temp', 'r+');
    fwrite($stream, $csvText);
    rewind($stream);

    $rows = [];
    while (($row = fgetcsv($stream, 0, $delimiter)) !== false) {
        if ($row === null) {
            continue;
        }
        if (count($row) === 1 && trim((string) $row[0]) === '') {
            continue;
        }
        $rows[] = $row;
    }
    fclose($stream);

    if (count($rows) === 0) {
        return ['error' => 'No CSV rows detected.'];
    }

    $firstRow = $rows[0];
    $columnCount = count($firstRow);
    $headers = [];

    if ($hasHeader) {
        for ($i = 0; $i < $columnCount; $i++) {
            $name = trim((string) ($firstRow[$i] ?? ''));
            if ($i === 0) {
                $name = preg_replace('/^\xEF\xBB\xBF/', '', $name);
            }
            $headers[] = $name !== '' ? $name : 'column_' . ($i + 1);
        }
        $dataRows = array_slice($rows, 1);
    } else {
        for ($i = 0; $i < $columnCount; $i++) {
            $headers[] = 'column_' . ($i + 1);
        }
        $dataRows = $rows;
        $warnings[] = 'Header row disabled. Generated placeholder column names.';
    }

    $seenHeaders = [];
    $duplicateHeaders = [];
    foreach ($headers as $header) {
        $normalized = normalizeCsvImportKey($header);
        if ($normalized === '') {
            continue;
        }
        if (isset($seenHeaders[$normalized])) {
            $duplicateHeaders[] = $header;
            continue;
        }
        $seenHeaders[$normalized] = true;
    }
    if (count($duplicateHeaders) > 0) {
        $warnings[] = 'Duplicate columns detected: ' . implode(', ', $duplicateHeaders);
    }

    $mappingSuggestions = [];
    foreach ($headers as $header) {
        $guess = guessCsvImportField($header);
        $mappingSuggestions[] = [
            'column' => $header,
            'suggestedField' => $guess['field'],
            'confidence' => $guess['confidence'],
        ];
    }

    $sampleRows = [];
    $maxSamples = min(5, count($dataRows));
    for ($rowIndex = 0; $rowIndex < $maxSamples; $rowIndex++) {
        $row = $dataRows[$rowIndex];
        $sample = [];
        foreach ($headers as $index => $header) {
            $sample[$header] = trim((string) ($row[$index] ?? ''));
        }
        $sampleRows[] = $sample;
    }

    $resolvedMapping = csvImportResolveMapping(
        $headers,
        $mappingSuggestions,
        $data['mapping'] ?? null,
        $warnings
    );

    $fieldToColumnIndex = [];
    foreach ($resolvedMapping as $mapping) {
        $columnIndex = array_search($mapping['column'], $headers, true);
        if ($columnIndex !== false) {
            $fieldToColumnIndex[$mapping['field']] = $columnIndex;
        }
    }

    $requiredFieldKeys = [];
    foreach (csvImportCanonicalFields() as $field) {
        if (!empty($field['required'])) {
            $requiredFieldKeys[] = $field['key'];
            if (!isset($fieldToColumnIndex[$field['key']])) {
                $warnings[] = "Required field '{$field['label']}' has no mapped CSV column.";
            }
        }
    }

    $validRows = 0;
    $errorRows = 0;
    $warningRows = 0;
    $rowFindings = [];
    $errorFindings = [];
    $warningFindings = [];
    $allRows = [];
    $maxFindings = 100;
    $maxErrorFindings = 1000;
    $maxWarningFindings = 100;

    foreach ($dataRows as $rowIndex => $row) {
        $rowErrors = [];
        $rowWarnings = [];
        $normalized = [];
        $rawRow = [];
        foreach ($headers as $index => $header) {
            $rawRow[$header] = trim((string) ($row[$index] ?? ''));
        }

        foreach ($requiredFieldKeys as $requiredKey) {
            if (!isset($fieldToColumnIndex[$requiredKey])) {
                continue;
            }
            $index = $fieldToColumnIndex[$requiredKey];
            $raw = trim((string) ($row[$index] ?? ''));
            $normalized[$requiredKey] = $raw;
            if ($raw === '') {
                $rowErrors[] = "Required field '$requiredKey' is blank.";
            }
        }

        if (isset($fieldToColumnIndex['titleName'])) {
            $normalized['titleName'] = trim((string) ($row[$fieldToColumnIndex['titleName']] ?? ''));
        }

        if (isset($fieldToColumnIndex['seriesName']) && (!isset($normalized['titleName']) || $normalized['titleName'] === '')) {
            $derivedTitleName = csvImportDeriveTitleNameFromSeriesName($row[$fieldToColumnIndex['seriesName']] ?? '');
            if ($derivedTitleName !== null && $derivedTitleName !== '') {
                $normalized['titleName'] = $derivedTitleName;
                $rowWarnings[] = "titleName derived from seriesName ('$derivedTitleName').";
            }
        }

        foreach (['volume', 'startYear', 'quantity'] as $integerField) {
            if (!isset($fieldToColumnIndex[$integerField])) {
                continue;
            }
            $result = csvImportParseInteger($row[$fieldToColumnIndex[$integerField]] ?? '');
            $normalized[$integerField] = $result['value'];
            if ($result['error']) {
                $rowErrors[] = "$integerField: {$result['error']}";
            }
        }

        foreach (['coverPrice', 'purchasePrice', 'guideValue', 'issueValue'] as $decimalField) {
            if (!isset($fieldToColumnIndex[$decimalField])) {
                continue;
            }
            $result = csvImportParseDecimal($row[$fieldToColumnIndex[$decimalField]] ?? '');
            $normalized[$decimalField] = $result['value'];
            if ($result['error']) {
                $rowErrors[] = "$decimalField: {$result['error']}";
            }
        }

        foreach (['coverDate', 'purchaseDate'] as $dateField) {
            if (!isset($fieldToColumnIndex[$dateField])) {
                continue;
            }
            $result = csvImportParseDate($row[$fieldToColumnIndex[$dateField]] ?? '');
            $normalized[$dateField] = $result['value'];
            if ($result['error']) {
                $rowErrors[] = "$dateField: {$result['error']}";
            }
        }

        if (isset($fieldToColumnIndex['status'])) {
            $statusResult = csvImportParseStatus($row[$fieldToColumnIndex['status']] ?? '');
            $normalized['status'] = $statusResult['value'];
            if ($statusResult['error']) {
                $rowErrors[] = "status: {$statusResult['error']}";
            }
        }

        foreach (['storyTitle', 'publisher', 'seriesName', 'seriesType', 'issueNumber', 'printRun', 'condition', 'location', 'guide', 'comments'] as $stringField) {
            if (!isset($fieldToColumnIndex[$stringField])) {
                continue;
            }
            $normalized[$stringField] = trim((string) ($row[$fieldToColumnIndex[$stringField]] ?? ''));
        }

        $rowNumber = $hasHeader ? ($rowIndex + 2) : ($rowIndex + 1);
        $rowState = [
            'rowNumber' => $rowNumber,
            'errors' => $rowErrors,
            'warnings' => $rowWarnings,
            'normalized' => $normalized,
            'raw' => $rawRow,
        ];

        if (count($rowErrors) > 0) {
            $errorRows++;
        } elseif (count($rowWarnings) > 0) {
            $warningRows++;
        } else {
            $validRows++;
        }

        if (count($rowErrors) > 0 && count($errorFindings) < $maxErrorFindings) {
            $errorFindings[] = $rowState;
        } elseif (count($rowWarnings) > 0 && count($warningFindings) < $maxWarningFindings) {
            $warningFindings[] = $rowState;
        }
        if ((count($rowErrors) > 0 || count($rowWarnings) > 0) && count($rowFindings) < $maxFindings) {
            if (count($rowErrors) > 0) {
                $rowFindings[] = $rowState;
            }
        }
        if ($includeRows) {
            $allRows[] = $rowState;
        }
    }

    if (count($rowFindings) < $maxFindings) {
        foreach ($warningFindings as $warningRowState) {
            if (count($rowFindings) >= $maxFindings) {
                break;
            }
            $rowFindings[] = $warningRowState;
        }
    }

    $payload = [
        'headers' => $headers,
        'rowCount' => count($dataRows),
        'sampleRows' => $sampleRows,
        'mappingSuggestions' => $mappingSuggestions,
        'resolvedMapping' => $resolvedMapping,
        'canonicalFields' => csvImportCanonicalFields(),
        'warnings' => $warnings,
        'validation' => [
            'validRows' => $validRows,
            'errorRows' => $errorRows,
            'warningRows' => $warningRows,
            'sampledFindingLimit' => $maxFindings,
            'sampledFindings' => count($rowFindings),
            'sampledErrorFindings' => count($errorFindings),
            'sampledWarningFindings' => count($warningFindings),
            'sampledErrorFindingLimit' => $maxErrorFindings,
            'sampledWarningFindingLimit' => $maxWarningFindings,
        ],
        'rowFindings' => $rowFindings,
        'errorFindings' => $errorFindings,
        'warningFindings' => $warningFindings,
    ];
    if ($includeRows) {
        $payload['allRows'] = $allRows;
    }
    return $payload;
}

function previewCsvImport($dataJson)
{
    $data = json_decode($dataJson, true);
    return json_encode(csvImportBuildPreviewPayload($data, false));
}

function csvImportIssueStoryTitleColumnExists($db)
{
    $query = "SHOW COLUMNS FROM issues LIKE 'story_title'";
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }
    return $result->num_rows > 0;
}

function csvImportFindPublisherId($db, $publisherName)
{
    $escaped = $db->real_escape_string($publisherName);
    $query = "SELECT id FROM publisher WHERE name = '$escaped' LIMIT 1";
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $row = $result->fetch_assoc();
    return $row ? (int) $row['id'] : null;
}

function csvImportFindOrCreatePublisher($db, $publisherName)
{
    $escaped = $db->real_escape_string($publisherName);
    $query = "INSERT IGNORE INTO publisher (name) VALUES ('$escaped')";
    $db->query($query);
    return csvImportFindPublisherId($db, $publisherName);
}

function csvImportFindSeriesId($db, $publisherId, $seriesName, $volume, $startYear)
{
    $seriesNameEscaped = $db->real_escape_string($seriesName);
    $volumeCondition = $volume === null ? 'volume IS NULL' : ('volume=' . (int) $volume);
    $startYearCondition = $startYear === null ? 'start_year IS NULL' : ('start_year=' . (int) $startYear);
    $query = "SELECT id FROM series WHERE publisher_id=$publisherId AND name='$seriesNameEscaped' AND $volumeCondition AND $startYearCondition LIMIT 1";
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $row = $result->fetch_assoc();
    return $row ? (int) $row['id'] : null;
}

function csvImportCreateSeries($db, $publisherId, $normalized)
{
    $seriesName = $db->real_escape_string($normalized['seriesName']);
    $columns = ['publisher_id', 'name'];
    $values = [(int) $publisherId, "'$seriesName'"];
    if (isset($normalized['volume']) && $normalized['volume'] !== null) {
        $columns[] = 'volume';
        $values[] = (int) $normalized['volume'];
    }
    if (isset($normalized['startYear']) && $normalized['startYear'] !== null) {
        $columns[] = 'start_year';
        $values[] = (int) $normalized['startYear'];
    }
    if (isset($normalized['seriesType']) && trim((string) $normalized['seriesType']) !== '') {
        $columns[] = 'type';
        $values[] = "'" . $db->real_escape_string(trim((string) $normalized['seriesType'])) . "'";
    }
    $query = "INSERT INTO series (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ")";
    if (! $db->query($query)) {
        die('There was an error running the query [' . $db->error . ']');
    }
    return (int) $db->insert_id;
}

function csvImportUpdateSeriesMetadata($db, $seriesId, $normalized, $mappedFieldSet)
{
    $terms = [];
    if (isset($mappedFieldSet['publisher'])) {
        $publisher = isset($normalized['publisher']) && trim((string) $normalized['publisher']) !== '' ? trim((string) $normalized['publisher']) : 'Unknown';
        $pubId = csvImportFindOrCreatePublisher($db, $publisher);
        if ($pubId !== null) {
            $terms[] = "publisher_id=" . (int) $pubId;
        }
    }
    if (isset($mappedFieldSet['seriesType'])) {
        $seriesType = isset($normalized['seriesType']) ? trim((string) $normalized['seriesType']) : '';
        if ($seriesType === '') {
            $terms[] = "type=NULL";
        } else {
            $terms[] = "type='" . $db->real_escape_string($seriesType) . "'";
        }
    }
    if (isset($mappedFieldSet['volume'])) {
        if (!array_key_exists('volume', $normalized) || $normalized['volume'] === null) {
            $terms[] = "volume=NULL";
        } else {
            $terms[] = "volume=" . (int) $normalized['volume'];
        }
    }
    if (isset($mappedFieldSet['startYear'])) {
        if (!array_key_exists('startYear', $normalized) || $normalized['startYear'] === null) {
            $terms[] = "start_year=NULL";
        } else {
            $terms[] = "start_year=" . (int) $normalized['startYear'];
        }
    }
    if (count($terms) === 0) {
        return false;
    }
    $query = "UPDATE series SET " . implode(', ', $terms) . " WHERE id=$seriesId";
    if (! $db->query($query)) {
        die('There was an error running the query [' . $db->error . ']');
    }
    return true;
}

function csvImportFindIssueId($db, $seriesId, $issueNumber, $printRunMapped, $printRun)
{
    $issueNumberEscaped = $db->real_escape_string($issueNumber);
    $query = "SELECT id FROM issues WHERE series=$seriesId AND number='$issueNumberEscaped'";
    if ($printRunMapped) {
        if ($printRun === null || trim((string) $printRun) === '') {
            $query .= " AND (printrun IS NULL OR printrun='')";
        } else {
            $query .= " AND printrun='" . $db->real_escape_string(trim((string) $printRun)) . "'";
        }
    }
    $query .= " LIMIT 1";
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $row = $result->fetch_assoc();
    return $row ? (int) $row['id'] : null;
}

function csvImportIssueFieldMap()
{
    return [
        'issueNumber' => 'number',
        'printRun' => 'printrun',
        'quantity' => 'quantity',
        'coverDate' => 'cover_date',
        'purchaseDate' => 'purchase_date',
        'status' => 'status',
        'condition' => 'bkcondition',
        'coverPrice' => 'cover_price',
        'purchasePrice' => 'purchase_price',
        'guideValue' => 'guide_value',
        'guide' => 'guide',
        'issueValue' => 'issue_value',
        'location' => 'location',
        'comments' => 'comments',
    ];
}

function csvImportSqlValue($db, $field, $value)
{
    if ($value === null || $value === '') {
        return 'NULL';
    }
    $numericFields = ['quantity', 'status', 'coverPrice', 'purchasePrice', 'guideValue', 'issueValue'];
    if (in_array($field, $numericFields, true)) {
        return (string) $value;
    }
    $escaped = $db->real_escape_string((string) $value);
    return "'$escaped'";
}

function csvImportEnsureLogTables($db)
{
    $runTableQuery = <<<EOT
      CREATE TABLE IF NOT EXISTS import_runs (
          run_id VARCHAR(64) NOT NULL,
          mode VARCHAR(20) NOT NULL,
          total_rows INT NOT NULL,
          valid_rows INT NOT NULL,
          error_rows INT NOT NULL,
          warning_rows INT NOT NULL,
          skipped_invalid_rows INT NOT NULL,
          inserted_titles INT NOT NULL,
          inserted_series INT NOT NULL,
          updated_series INT NOT NULL,
          inserted_issues INT NOT NULL,
          updated_issues INT NOT NULL,
          skipped_existing_issues INT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (run_id),
          KEY idx_import_runs_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
EOT;
    if (! $db->query($runTableQuery)) {
        die('There was an error running the query [' . $db->error . ']');
    }

    $skippedRowsTableQuery = <<<EOT
      CREATE TABLE IF NOT EXISTS import_skipped_rows (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          run_id VARCHAR(64) NOT NULL,
          source_row_number INT NOT NULL,
          error_text TEXT NOT NULL,
          warning_text TEXT NULL,
          raw_row LONGTEXT NULL,
          normalized_row LONGTEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_import_skipped_rows_run_id (run_id),
          CONSTRAINT fk_import_skipped_rows_run_id FOREIGN KEY (run_id) REFERENCES import_runs(run_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
EOT;
    if (! $db->query($skippedRowsTableQuery)) {
        if ((int) $db->errno !== 1826) {
            die('There was an error running the query [' . $db->error . ']');
        }
        // Duplicate FK name from legacy DB state; retry without constraint to stay operational.
        $fallbackQuery = <<<EOT
          CREATE TABLE IF NOT EXISTS import_skipped_rows (
              id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
              run_id VARCHAR(64) NOT NULL,
              source_row_number INT NOT NULL,
              error_text TEXT NOT NULL,
              warning_text TEXT NULL,
              raw_row LONGTEXT NULL,
              normalized_row LONGTEXT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (id),
              KEY idx_import_skipped_rows_run_id (run_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
EOT;
        if (! $db->query($fallbackQuery)) {
            die('There was an error running the query [' . $db->error . ']');
        }
    }
}

function csvImportGenerateRunId()
{
    $random = bin2hex(random_bytes(6));
    return 'import_' . date('Ymd_His') . '_' . $random;
}

function csvImportLogRunSummary($db, $runId, $summary)
{
    $mode = $db->real_escape_string($summary['mode']);
    $query = <<<EOT
      INSERT INTO import_runs (
          run_id, mode, total_rows, valid_rows, error_rows, warning_rows, skipped_invalid_rows,
          inserted_titles, inserted_series, updated_series, inserted_issues, updated_issues, skipped_existing_issues
      ) VALUES (
          '{$db->real_escape_string($runId)}',
          '$mode',
          {$summary['rowCount']},
          {$summary['validRows']},
          {$summary['errorRows']},
          {$summary['warningRows']},
          {$summary['skippedInvalidRows']},
          {$summary['insertedTitles']},
          {$summary['insertedSeries']},
          {$summary['updatedSeries']},
          {$summary['insertedIssues']},
          {$summary['updatedIssues']},
          {$summary['skippedExistingIssues']}
      )
EOT;
    if (! $db->query($query)) {
        die('There was an error running the query [' . $db->error . ']');
    }
}

function csvImportLogSkippedRows($db, $runId, $rows)
{
    $logged = 0;
    foreach ($rows as $rowState) {
        if (!isset($rowState['errors']) || count($rowState['errors']) === 0) {
            continue;
        }
        $errors = $db->real_escape_string(implode(' | ', $rowState['errors']));
        $warnings = isset($rowState['warnings']) && count($rowState['warnings']) > 0 ? "'" . $db->real_escape_string(implode(' | ', $rowState['warnings'])) . "'" : "NULL";
        $rawJson = isset($rowState['raw']) ? "'" . $db->real_escape_string(json_encode($rowState['raw'])) . "'" : "NULL";
        $normalizedJson = isset($rowState['normalized']) ? "'" . $db->real_escape_string(json_encode($rowState['normalized'])) . "'" : "NULL";
        $rowNumber = isset($rowState['rowNumber']) ? (int) $rowState['rowNumber'] : 0;
        $query = <<<EOT
          INSERT INTO import_skipped_rows (run_id, source_row_number, error_text, warning_text, raw_row, normalized_row)
          VALUES ('{$db->real_escape_string($runId)}', $rowNumber, '$errors', $warnings, $rawJson, $normalizedJson)
EOT;
        if (! $db->query($query)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        $logged++;
    }
    return $logged;
}

function csvImportFetchSkippedRows($db, $runId, $limit)
{
    $runIdEscaped = $db->real_escape_string($runId);
    $limit = max(1, min(2000, (int) $limit));
    $query = <<<EOT
      SELECT id, run_id, source_row_number, error_text, warning_text, raw_row, normalized_row, created_at
        FROM import_skipped_rows
       WHERE run_id = '$runIdEscaped'
    ORDER BY source_row_number ASC, id ASC
       LIMIT $limit
EOT;
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            'id' => (int) $row['id'],
            'runId' => $row['run_id'],
            'rowNumber' => (int) $row['source_row_number'],
            'errors' => $row['error_text'],
            'warnings' => $row['warning_text'],
            'raw' => $row['raw_row'] ? json_decode($row['raw_row'], true) : null,
            'normalized' => $row['normalized_row'] ? json_decode($row['normalized_row'], true) : null,
            'createdAt' => $row['created_at'],
        ];
    }
    return $rows;
}

function csvImportFetchRuns($db, $limit)
{
    $limit = max(1, min(500, (int) $limit));
    $query = <<<EOT
      SELECT run_id, mode, total_rows, valid_rows, error_rows, warning_rows, skipped_invalid_rows,
             inserted_titles, inserted_series, updated_series, inserted_issues, updated_issues, skipped_existing_issues,
             created_at
        FROM import_runs
    ORDER BY created_at DESC
       LIMIT $limit
EOT;
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $runs = [];
    while ($row = $result->fetch_assoc()) {
        $runs[] = [
            'runId' => $row['run_id'],
            'mode' => $row['mode'],
            'totalRows' => (int) $row['total_rows'],
            'validRows' => (int) $row['valid_rows'],
            'errorRows' => (int) $row['error_rows'],
            'warningRows' => (int) $row['warning_rows'],
            'skippedInvalidRows' => (int) $row['skipped_invalid_rows'],
            'insertedTitles' => (int) $row['inserted_titles'],
            'insertedSeries' => (int) $row['inserted_series'],
            'updatedSeries' => (int) $row['updated_series'],
            'insertedIssues' => (int) $row['inserted_issues'],
            'updatedIssues' => (int) $row['updated_issues'],
            'skippedExistingIssues' => (int) $row['skipped_existing_issues'],
            'createdAt' => $row['created_at'],
        ];
    }
    return $runs;
}

function csvImportCommit($dataJson)
{
    $data = json_decode($dataJson, true);
    $analysis = csvImportBuildPreviewPayload($data, true);
    if (isset($analysis['error'])) {
        return json_encode($analysis);
    }

    $mode = isset($data['mode']) ? trim((string) $data['mode']) : 'upsert';
    if (! in_array($mode, ['upsert', 'create-only', 'dry-run'], true)) {
        $mode = 'upsert';
    }

    $summary = [
        'mode' => $mode,
        'rowCount' => (int) $analysis['rowCount'],
        'validRows' => (int) $analysis['validation']['validRows'],
        'errorRows' => (int) $analysis['validation']['errorRows'],
        'warningRows' => (int) $analysis['validation']['warningRows'],
        'insertedTitles' => 0,
        'insertedSeries' => 0,
        'insertedIssues' => 0,
        'updatedSeries' => 0,
        'updatedIssues' => 0,
        'skippedExistingIssues' => 0,
        'skippedInvalidRows' => 0,
    ];

    $db = ComicDB_DB::db();
    csvImportEnsureLogTables($db);
    ensureSeriesTotalSchema($db);
    $runId = csvImportGenerateRunId();

    if ($mode === 'dry-run') {
        $summary['skippedInvalidRows'] = $summary['errorRows'];
        csvImportLogRunSummary($db, $runId, $summary);
        $loggedSkippedRows = csvImportLogSkippedRows($db, $runId, $analysis['allRows']);
        return json_encode([
            'runId' => $runId,
            'summary' => $summary,
            'warnings' => $analysis['warnings'],
            'rowFindings' => $analysis['rowFindings'],
            'loggedSkippedRows' => $loggedSkippedRows,
            'message' => 'Dry run only: no database writes performed.',
        ]);
    }

    $storyTitleSupported = csvImportIssueStoryTitleColumnExists($db);
    $mappedFieldSet = [];
    foreach ($analysis['resolvedMapping'] as $mapping) {
        $mappedFieldSet[$mapping['field']] = true;
    }
    if (isset($mappedFieldSet['storyTitle']) && ! $storyTitleSupported) {
        $analysis['warnings'][] = "Mapped field 'storyTitle' is ignored because issues.story_title does not exist in this database.";
    }

    $publisherCache = [];
    $seriesCache = [];
    $issueFieldMap = csvImportIssueFieldMap();

    foreach ($analysis['allRows'] as $rowState) {
        if (count($rowState['errors']) > 0) {
            $summary['skippedInvalidRows']++;
            continue;
        }

        $normalized = $rowState['normalized'];
        $seriesName = isset($normalized['seriesName']) ? trim((string) $normalized['seriesName']) : '';
        $issueNumber = isset($normalized['issueNumber']) ? trim((string) $normalized['issueNumber']) : '';
        if ($seriesName === '' || $issueNumber === '') {
            $summary['skippedInvalidRows']++;
            continue;
        }

        $publisherName = isset($normalized['publisher']) && trim((string) $normalized['publisher']) !== '' ? trim((string) $normalized['publisher']) : 'Unknown';
        $publisherCacheKey = strtolower($publisherName);
        if (isset($publisherCache[$publisherCacheKey])) {
            $publisherId = $publisherCache[$publisherCacheKey];
        } else {
            $publisherId = csvImportFindOrCreatePublisher($db, $publisherName);
            $publisherCache[$publisherCacheKey] = $publisherId;
        }

        $volume = isset($normalized['volume']) ? $normalized['volume'] : null;
        $startYear = isset($normalized['startYear']) ? $normalized['startYear'] : null;
        $seriesCacheKey = $publisherId . '|' . strtolower($seriesName) . '|' . ($volume === null ? 'null' : (string) $volume) . '|' . ($startYear === null ? 'null' : (string) $startYear);
        if (isset($seriesCache[$seriesCacheKey])) {
            $seriesId = $seriesCache[$seriesCacheKey];
        } else {
            $seriesId = csvImportFindSeriesId($db, $publisherId, $seriesName, $volume, $startYear);
            if ($seriesId === null) {
                $seriesId = csvImportCreateSeries($db, $publisherId, $normalized);
                $summary['insertedSeries']++;
            } elseif ($mode === 'upsert') {
                if (csvImportUpdateSeriesMetadata($db, $seriesId, $normalized, $mappedFieldSet)) {
                    $summary['updatedSeries']++;
                }
            }
            $seriesCache[$seriesCacheKey] = $seriesId;
        }

        $printRunMapped = isset($mappedFieldSet['printRun']);
        $printRunValue = $printRunMapped && isset($normalized['printRun']) ? $normalized['printRun'] : null;
        $issueId = csvImportFindIssueId($db, $seriesId, $issueNumber, $printRunMapped, $printRunValue);

        if ($issueId !== null && $mode === 'create-only') {
            $summary['skippedExistingIssues']++;
            continue;
        }

        if ($issueId === null) {
            $columns = ['series', 'number'];
            $values = [(int) $seriesId, "'" . $db->real_escape_string($issueNumber) . "'"];
            foreach ($issueFieldMap as $field => $column) {
                if ($field === 'issueNumber' || !isset($mappedFieldSet[$field])) {
                    continue;
                }
                if (!array_key_exists($field, $normalized)) {
                    continue;
                }
                $columns[] = $column;
                $values[] = csvImportSqlValue($db, $field, $normalized[$field]);
            }
            if ($storyTitleSupported && isset($mappedFieldSet['storyTitle']) && array_key_exists('storyTitle', $normalized)) {
                $columns[] = 'story_title';
                $values[] = csvImportSqlValue($db, 'storyTitle', $normalized['storyTitle']);
            }
            $query = "INSERT INTO issues (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ")";
            if (! $db->query($query)) {
                die('There was an error running the query [' . $db->error . ']');
            }
            $summary['insertedIssues']++;
            continue;
        }

        $updateTerms = [];
        foreach ($issueFieldMap as $field => $column) {
            if ($field === 'issueNumber' || !isset($mappedFieldSet[$field])) {
                continue;
            }
            if (!array_key_exists($field, $normalized)) {
                $updateTerms[] = "$column=NULL";
            } else {
                $updateTerms[] = "$column=" . csvImportSqlValue($db, $field, $normalized[$field]);
            }
        }
        if ($storyTitleSupported && isset($mappedFieldSet['storyTitle'])) {
            if (!array_key_exists('storyTitle', $normalized)) {
                $updateTerms[] = "story_title=NULL";
            } else {
                $updateTerms[] = "story_title=" . csvImportSqlValue($db, 'storyTitle', $normalized['storyTitle']);
            }
        }
        if (count($updateTerms) === 0) {
            $summary['skippedExistingIssues']++;
            continue;
        }
        $updateQuery = "UPDATE issues SET " . implode(', ', $updateTerms) . " WHERE id=$issueId";
        if (! $db->query($updateQuery)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        $summary['updatedIssues']++;
    }

    csvImportLogRunSummary($db, $runId, $summary);
    $loggedSkippedRows = csvImportLogSkippedRows($db, $runId, $analysis['allRows']);

    return json_encode([
        'runId' => $runId,
        'summary' => $summary,
        'warnings' => $analysis['warnings'],
        'rowFindings' => $analysis['rowFindings'],
        'loggedSkippedRows' => $loggedSkippedRows,
    ]);
}

function commitCsvImport($dataJson)
{
    return csvImportCommit($dataJson);
}

function grabCsvImportRuns($limit = '50')
{
    $db = ComicDB_DB::db();
    csvImportEnsureLogTables($db);
    $runs = csvImportFetchRuns($db, $limit);
    return json_encode([
        'runs' => $runs,
        'count' => count($runs),
    ]);
}

function grabCsvImportSkippedRows($runId, $limit = '500')
{
    $db = ComicDB_DB::db();
    csvImportEnsureLogTables($db);
    $rows = csvImportFetchSkippedRows($db, $runId, $limit);
    return json_encode([
        'runId' => $runId,
        'rows' => $rows,
        'count' => count($rows),
    ]);
}

function grabCsvImportSkippedRowsCsv($runId, $limit = '2000')
{
    $db = ComicDB_DB::db();
    csvImportEnsureLogTables($db);
    $rows = csvImportFetchSkippedRows($db, $runId, $limit);
    $stream = fopen('php://temp', 'r+');
    fputcsv($stream, ['run_id', 'row_number', 'errors', 'warnings', 'raw_json', 'normalized_json', 'created_at']);
    foreach ($rows as $row) {
        fputcsv($stream, [
            $row['runId'],
            $row['rowNumber'],
            $row['errors'],
            $row['warnings'] ?? '',
            json_encode($row['raw']),
            json_encode($row['normalized']),
            $row['createdAt'],
        ]);
    }
    rewind($stream);
    $csv = stream_get_contents($stream);
    fclose($stream);
    return $csv;
}

function comicVineSearch($query)
{
    $db      = ComicDB_DB::db();
    $results = ComicVine::searchVolumes($db, trim((string) $query));
    if (isset($results['error'])) {
        return json_encode(['error' => $results['error']]);
    }
    return json_encode(['results' => $results]);
}

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

function grabSeriesList($dataJson)
{
    $filters = json_decode($dataJson, true);
    $publisherId = isset($filters['publisherId']) ? (int) $filters['publisherId'] : 0;
    $db = ComicDB_DB::db();
    ensureSeriesTotalSchema($db);
    $whereClauses = [];

    if ($publisherId > 0) {
        $whereClauses[] = "s.publisher_id = $publisherId";
    }

    $where = '';
    if (count($whereClauses) > 0) {
        $where = 'WHERE ' . implode(' AND ', $whereClauses);
    }
    $minimumIssueCount = isset($filters['minimumIssueCount']) ? (int) $filters['minimumIssueCount'] : 0;
    $having = "HAVING COUNT(i.id) >= $minimumIssueCount";

    $query = <<<EOT
      SELECT s.id,
             s.publisher_id,
             s.name,
             s.volume,
             s.start_year,
             p.name AS publisher_name,
             COALESCE(s.total_issues, 0) AS total_issues,
             COUNT(i.id) AS issue_count,
             GREATEST(COALESCE(s.total_issues, 0) - COUNT(i.id), 0) AS missing_issues,
             CASE
                 WHEN COALESCE(s.total_issues, 0) > 0
                 THEN LEAST(ROUND((COUNT(i.id) / COALESCE(s.total_issues, 0)) * 100), 100)
                 ELSE 0
             END AS completion_percent
        FROM series s
   LEFT JOIN publisher p ON p.id = s.publisher_id
   LEFT JOIN issues i ON i.series = s.id
        $where
     GROUP BY s.id, s.publisher_id, s.name, s.volume, s.start_year, p.name, s.total_issues
      $having
     ORDER BY p.name ASC, s.name ASC
EOT;
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }

    $list = [];
    while ($row = $result->fetch_assoc()) {
        $list[] = [
            'id' => (int) $row['id'],
            'publisherId' => (int) $row['publisher_id'],
            'name' => $row['name'],
            'volume' => isset($row['volume']) ? (int) $row['volume'] : 0,
            'startYear' => isset($row['start_year']) ? (int) $row['start_year'] : 0,
            'publisherName' => $row['publisher_name'] ?? '',
            'issueCount' => isset($row['issue_count']) ? (int) $row['issue_count'] : 0,
            'totalIssues' => isset($row['total_issues']) ? (int) $row['total_issues'] : 0,
            'missingIssues' => isset($row['missing_issues']) ? (int) $row['missing_issues'] : 0,
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
        'publisherId'  => $series->publisherId(),
        'name'         => $series->name(),
        'volume'       => $series->volume(),
        'startYear'    => $series->startYear(),
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

// Create a Series — optionally seed issue stubs from a ComicVine volume
function createSeries($dataJson)
{
    $data   = json_decode($dataJson, true);
    $db     = ComicDB_DB::db();
    ensureSeriesTotalSchema($db);
    $series = new ComicDB_Series();
    $series->publisherId($data['publisherId']);
    $series->name($data['name']);
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
    $seriesId = $series->id();

    // Seed issue stubs from ComicVine when a volume ID is provided
    $seededIssues = 0;
    if (!empty($data['comicvineVolumeId'])) {
        $volumeId = (int) $data['comicvineVolumeId'];
        $volume   = ComicVine::getVolumeIssues($db, $volumeId);
        if (!isset($volume['error']) && !empty($volume['issues'])) {
            foreach ($volume['issues'] as $i => $issue) {
                $number  = isset($issue['issueNumber']) && trim((string) $issue['issueNumber']) !== ''
                    ? $db->real_escape_string(trim((string) $issue['issueNumber']))
                    : (string) ($i + 1);
                $sort    = is_numeric($number) ? (int) $number : ($i + 1);
                $query   = "INSERT IGNORE INTO issues (series, number, sort, owned) VALUES ($seriesId, '$number', $sort, 0)";
                if ($db->query($query)) {
                    $seededIssues++;
                }
            }
        }
    }

    return json_encode(['id' => $seriesId, 'name' => $series->name(), 'seededIssues' => $seededIssues]);
}

// Update a Series
function updateSeries($id, $dataJson)
{
    $data   = json_decode($dataJson, true);
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $series = new ComicDB_Series($id);
    $series->restore();
    if (isset($data['publisherId'])) {
        $series->publisherId($data['publisherId']);
    }

    if (isset($data['name'])) {
        $series->name($data['name']);
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
        'seriesId' => 'seriesId',
        'number' => 'number',
        'storyTitle' => 'storyTitle',
        'sort' => 'sort',
        'printRun' => 'printRun',
        'quantity' => 'quantity',
        'coverDate' => 'coverDate',
        'location' => 'location',
        'type' => 'type',
        'status' => 'status',
        'condition' => 'condition',
        'coverPrice' => 'coverPrice',
        'purchasePrice' => 'purchasePrice',
        'purchaseDate' => 'purchaseDate',
        'guideValue' => 'guideValue',
        'guide' => 'guide',
        'issueValue' => 'issueValue',
        'comments' => 'comments',
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
    $data  = json_decode($dataJson, true);
    ensureSeriesTotalSchema(ComicDB_DB::db());
    $issue = new ComicDB_Issue();
    applyIssueData($issue, $data);

    $issue->save();
    return json_encode(['id' => $issue->id(), 'number' => $issue->number()]);
}

// Update an Issue
function updateIssue($id, $dataJson)
{
    $data  = json_decode($dataJson, true);
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
    $filters = json_decode($dataJson, true);
    $seriesId = isset($filters['seriesId']) ? (int) $filters['seriesId'] : 0;
    $db = ComicDB_DB::db();
    $whereClauses = [];

    if ($seriesId > 0) {
        $whereClauses[] = "i.series = $seriesId";
    }

    $where = '';
    if (count($whereClauses) > 0) {
        $where = 'WHERE ' . implode(' AND ', $whereClauses);
    }

    $query = <<<EOT
      SELECT i.id,
             i.number,
             i.sort,
             i.series AS series_id,
             s.name AS series_name
        FROM issues i
   LEFT JOIN series s ON s.id = i.series
       $where
    ORDER BY s.name ASC,
             CASE WHEN i.sort IS NOT NULL AND i.sort > 0 THEN 0 ELSE 1 END ASC,
             CASE WHEN i.sort IS NOT NULL AND i.sort > 0 THEN i.sort ELSE 2147483647 END ASC,
             CASE WHEN i.number REGEXP '^-?[0-9]+$' THEN 0 ELSE 1 END ASC,
             CASE WHEN i.number REGEXP '^-?[0-9]+$' THEN CAST(i.number AS SIGNED) ELSE 0 END ASC,
             i.number ASC
EOT;
    $result = $db->query($query);
    if (! $result) {
        die('There was an error running the query [' . $db->error . ']');
    }

    $list = [];
    while ($row = $result->fetch_assoc()) {
        $list[] = [
            'id' => (int) $row['id'],
            'number' => $row['number'],
            'seriesId' => (int) $row['series_id'],
            'seriesName' => $row['series_name'] ?? '',
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
    $db = ComicDB_DB::db();
    $query = <<<EOT
      SELECT p.id, p.name, COUNT(DISTINCT s.id) AS title_count
        FROM publisher p
   LEFT JOIN series s ON s.publisher_id = p.id
    GROUP BY p.id, p.name
    ORDER BY p.name ASC
EOT;
    $result = $db->query($query);
    $list = [];
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

    $totalsQuery = <<<EOT
      SELECT (SELECT COUNT(*) FROM publisher) AS publishers,
             (SELECT COUNT(*) FROM series) AS series,
             (SELECT COUNT(*) FROM issues) AS issues_owned
EOT;
    $totalsResult = $db->query($totalsQuery);
    if (! $totalsResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $totalsRow = $totalsResult->fetch_assoc();

    $valuesQuery = <<<EOT
      SELECT COALESCE(SUM(issue_value), 0) AS issue_value,
             COALESCE(SUM(purchase_price), 0) AS purchase_price,
             COALESCE(SUM(cover_price), 0) AS cover_price
        FROM issues
EOT;
    $valuesResult = $db->query($valuesQuery);
    if (! $valuesResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $valuesRow = $valuesResult->fetch_assoc();

    $statusQuery = <<<EOT
      SELECT status, COUNT(*) AS total
        FROM issues
    GROUP BY status
EOT;
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

    $topPublishersQuery = <<<EOT
      SELECT p.name, COUNT(i.id) AS issue_count
        FROM publisher p
   LEFT JOIN series s ON s.publisher_id = p.id
   LEFT JOIN issues i ON i.series = s.id
    GROUP BY p.id, p.name
    ORDER BY issue_count DESC, p.name ASC
       LIMIT 5
EOT;
    $topPublishersResult = $db->query($topPublishersQuery);
    if (! $topPublishersResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $topPublishers = [];
    while ($row = $topPublishersResult->fetch_assoc()) {
        $topPublishers[] = [
            'name' => $row['name'] ?? 'Unknown',
            'issueCount' => (int) $row['issue_count'],
        ];
    }

    $topTitlesQuery = <<<EOT
      SELECT s.name, COUNT(i.id) AS issue_count
        FROM series s
   LEFT JOIN issues i ON i.series = s.id
    GROUP BY s.id, s.name
    ORDER BY issue_count DESC, s.name ASC
       LIMIT 5
EOT;
    $topTitlesResult = $db->query($topTitlesQuery);
    if (! $topTitlesResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $topTitles = [];
    while ($row = $topTitlesResult->fetch_assoc()) {
        $topTitles[] = [
            'name' => $row['name'] ?? 'Unknown',
            'issueCount' => (int) $row['issue_count'],
        ];
    }

    $missingQuery = <<<EOT
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
EOT;
    $missingResult = $db->query($missingQuery);
    if (! $missingResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $missingRow = $missingResult->fetch_assoc();

    return json_encode([
        'totals' => [
            'publishers' => (int) $totalsRow['publishers'],
            'titles' => 0,
            'series' => (int) $totalsRow['series'],
            'issuesOwned' => (int) $totalsRow['issues_owned'],
        ],
        'values' => [
            'issueValue' => (float) $valuesRow['issue_value'],
            'purchasePrice' => (float) $valuesRow['purchase_price'],
            'coverPrice' => (float) $valuesRow['cover_price'],
        ],
        'statusBreakdown' => $statusBreakdown,
        'topPublishers' => $topPublishers,
        'topTitles' => $topTitles,
        'missing' => [
            'estimatedMissingIssues' => (int) $missingRow['estimated_missing_issues'],
            'seriesWithGaps' => (int) $missingRow['series_with_gaps'],
        ],
    ]);
}

function grabSeriesTypes()
{
    $typesList = new ComicDB_SeriesTypes();
    $types = $typesList->getAll();
    $list = [];
    foreach ($types as $type) {
        $list[] = [
            'id' => (int) $type->id(),
            'name' => $type->name(),
        ];
    }
    return json_encode(['series_types' => $list]);
}

function createPublisher($dataJson)
{
    $data = json_decode($dataJson, true);
    if (!isset($data['name']) || trim($data['name']) === '') {
        return json_encode(['error' => 'Publisher name is required.']);
    }
    $publisher = new ComicDB_Publisher();
    $publisher->name($data['name']);
    $publisher->save();
    return json_encode(['id' => $publisher->id(), 'name' => $publisher->name()]);
}

function updatePublisher($id, $dataJson)
{
    $data = json_decode($dataJson, true);
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

    $newName = $publisher->name();
    if ($oldName !== $newName) {
        $db = ComicDB_DB::db();
        $oldNameEscaped = $db->real_escape_string($oldName);
        $newNameEscaped = $db->real_escape_string($newName);
        $query = <<<EOT
          UPDATE series
             SET publisher = '$newNameEscaped'
           WHERE publisher = '$oldNameEscaped'
EOT;
        if (! $db->query($query)) {
            die('There was an error running the query [' . $db->error . ']');
        }
    }

    return json_encode(['id' => $publisher->id(), 'name' => $publisher->name()]);
}

function deletePublisher($id)
{
    $publisher = new ComicDB_Publisher();
    $publisher->id($id);
    $publisher->restore();
    $name = $publisher->name();
    $db = ComicDB_DB::db();
    $nameEscaped = $db->real_escape_string($name);
    $countQuery = <<<EOT
      SELECT COUNT(*) AS series_count
        FROM series
       WHERE publisher = '$nameEscaped'
EOT;
    $countResult = $db->query($countQuery);
    if (! $countResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $row = $countResult->fetch_assoc();
    $seriesCount = (int) $row['series_count'];
    if ($seriesCount > 0) {
        return json_encode([
            'deleted' => false,
            'id' => (int) $id,
            'error' => "Cannot delete publisher in use by $seriesCount series.",
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
        'seriesId' => (int) $id,
        'firstIssue' => is_numeric($firstIssue) ? (int) $firstIssue : null,
        'finalIssue' => is_numeric($finalIssue) ? (int) $finalIssue : null,
        'totalIssues' => is_numeric($series->totalIssues()) ? (int) $series->totalIssues() : 0,
        'gridable' => count($gridData) > 0,
        'issues' => $gridData,
    ];
}

function grabSeriesGrid($id)
{
    return json_encode(buildSeriesGridPayload($id));
}

function grabSeriesMissing($id)
{
    $seriesId = (int) $id;
    $db = ComicDB_DB::db();
    ensureSeriesTotalSchema($db);

    $seriesQuery = "SELECT total_issues FROM series WHERE id=$seriesId LIMIT 1";
    $seriesResult = $db->query($seriesQuery);
    if (! $seriesResult) {
        die('There was an error running the query [' . $db->error . ']');
    }
    $seriesRow = $seriesResult->fetch_assoc();
    if (!$seriesRow) {
        return json_encode([
            'seriesId' => $seriesId,
            'totalIssues' => 0,
            'ownedSlots' => 0,
            'missingCount' => 0,
            'missingSlots' => [],
        ]);
    }

    $totalIssues = isset($seriesRow['total_issues']) ? (int) $seriesRow['total_issues'] : 0;
    if ($totalIssues <= 0) {
        return json_encode([
            'seriesId' => $seriesId,
            'totalIssues' => 0,
            'ownedSlots' => 0,
            'missingCount' => 0,
            'missingSlots' => [],
        ]);
    }

    $issuesQuery = "SELECT number, sort FROM issues WHERE series=$seriesId";
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
        if (!isset($occupied[$slot])) {
            $missingSlots[] = ['slot' => $slot];
        }
    }

    return json_encode([
        'seriesId' => $seriesId,
        'totalIssues' => $totalIssues,
        'ownedSlots' => count($occupied),
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

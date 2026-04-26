import React, { useEffect, useState } from 'react';
import TitleEditor from './TitleEditor';
import TitleCreator from './TitleCreator';
import SeriesEditor from './SeriesEditor';
import SeriesCreator from './SeriesCreator';
import IssueEditor from './IssueEditor';
import IssueCreator from './IssueCreator';
import PublisherEditor from './PublisherEditor';
import PublisherCreator from './PublisherCreator';
import { Publisher } from '../app/App';

export interface Title {
    id: number;
    name: string;
}

interface IssueItem {
    id: number;
    number: string;
    seriesId: number;
    seriesName: string;
    titleId: number;
    titleName: string;
}

export type AdminView =
    | { mode: 'idle' }
    | { mode: 'editPublisher'; publisherId: number }
    | { mode: 'newPublisher' }
    | { mode: 'editTitle'; titleId: number }
    | { mode: 'newTitle' }
    | { mode: 'editSeries'; seriesId: number }
    | { mode: 'newSeries'; titleId: number }
    | { mode: 'editIssue'; issueId: number }
    | { mode: 'newIssue'; seriesId: number };

type AdminTab = 'publishers' | 'titles' | 'series' | 'issues' | 'import';

interface SeriesItem {
    id: number;
    titleId: number;
    name: string;
    volume?: number;
    startYear?: number;
    publisher: string;
    titleName: string;
    totalIssues?: number;
}

interface CsvImportField {
    key: string;
    label: string;
    required?: boolean;
}

interface CsvImportMappingSuggestion {
    column: string;
    suggestedField: string | null;
    confidence: 'exact' | 'alias' | 'none';
}

interface CsvImportPreview {
    headers: string[];
    rowCount: number;
    sampleRows: Record<string, string>[];
    mappingSuggestions: CsvImportMappingSuggestion[];
    resolvedMapping: Array<{
        field: string;
        column: string;
    }>;
    canonicalFields: CsvImportField[];
    warnings: string[];
    validation: {
        validRows: number;
        errorRows: number;
        warningRows: number;
        sampledFindingLimit: number;
        sampledFindings: number;
        sampledErrorFindings: number;
        sampledWarningFindings: number;
        sampledErrorFindingLimit: number;
        sampledWarningFindingLimit: number;
    };
    rowFindings: Array<{
        rowNumber: number;
        errors: string[];
        warnings: string[];
        normalized: Record<string, string | number | null>;
        raw: Record<string, string>;
    }>;
    errorFindings: Array<{
        rowNumber: number;
        errors: string[];
        warnings: string[];
        normalized: Record<string, string | number | null>;
        raw: Record<string, string>;
    }>;
    warningFindings: Array<{
        rowNumber: number;
        errors: string[];
        warnings: string[];
        normalized: Record<string, string | number | null>;
        raw: Record<string, string>;
    }>;
    error?: string;
}

type CsvImportColumnMapping = Record<string, string>;
type CsvImportMode = 'upsert' | 'create-only' | 'dry-run';

interface CsvImportCommitResult {
    runId: string;
    summary: {
        mode: CsvImportMode;
        rowCount: number;
        validRows: number;
        errorRows: number;
        warningRows: number;
        insertedTitles: number;
        insertedSeries: number;
        insertedIssues: number;
        updatedSeries: number;
        updatedIssues: number;
        skippedExistingIssues: number;
        skippedInvalidRows: number;
    };
    warnings: string[];
    rowFindings: CsvImportPreview['rowFindings'];
    loggedSkippedRows: number;
    message?: string;
    error?: string;
}

interface CsvImportSkippedRowsResponse {
    runId: string;
    count: number;
    rows: Array<{
        id: number;
        runId: string;
        rowNumber: number;
        errors: string;
        warnings: string | null;
        raw: Record<string, string> | null;
        normalized: Record<string, string | number | null> | null;
        createdAt: string;
    }>;
}

interface CsvImportRun {
    runId: string;
    mode: CsvImportMode;
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    skippedInvalidRows: number;
    insertedTitles: number;
    insertedSeries: number;
    updatedSeries: number;
    insertedIssues: number;
    updatedIssues: number;
    skippedExistingIssues: number;
    createdAt: string;
}

interface CsvImportRunsResponse {
    count: number;
    runs: CsvImportRun[];
}

function formatSeriesLabel(series: SeriesItem): string {
    const volumePart = series.volume ? ` (Vol ${series.volume})` : '';
    const yearPart = series.startYear ? ` ${series.startYear}` : '';
    const totalPart = series.totalIssues && series.totalIssues > 0 ? ` [Total: ${series.totalIssues}]` : '';
    return `${series.titleName}: ${series.name}${volumePart}${yearPart}${totalPart}`;
}

const AdminApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('issues');
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [selectedPublisherId, setSelectedPublisherId] = useState<number | null>(null);
    const [titles, setTitles] = useState<Title[]>([]);
    const [selectedTitleId, setSelectedTitleId] = useState<number | null>(null);
    const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
    const [seriesFilterTitleId, setSeriesFilterTitleId] = useState<number | null>(null);
    const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
    const [issueSeriesList, setIssueSeriesList] = useState<SeriesItem[]>([]);
    const [issuesFilterTitleId, setIssuesFilterTitleId] = useState<number | null>(null);
    const [issuesFilterSeriesId, setIssuesFilterSeriesId] = useState<number | null>(null);
    const [issueList, setIssueList] = useState<IssueItem[]>([]);
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
    const [view, setView] = useState<AdminView>({ mode: 'idle' });
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importDelimiter, setImportDelimiter] = useState(',');
    const [importHasHeader, setImportHasHeader] = useState(true);
    const [importPreview, setImportPreview] = useState<CsvImportPreview | null>(null);
    const [importColumnMapping, setImportColumnMapping] = useState<CsvImportColumnMapping>({});
    const [importMode, setImportMode] = useState<CsvImportMode>('upsert');
    const [importLoading, setImportLoading] = useState(false);
    const [importCommitLoading, setImportCommitLoading] = useState(false);
    const [importCommitResult, setImportCommitResult] = useState<CsvImportCommitResult | null>(null);
    const [importLoggedSkippedRows, setImportLoggedSkippedRows] = useState<CsvImportSkippedRowsResponse | null>(null);
    const [importSkippedRowsLoading, setImportSkippedRowsLoading] = useState(false);
    const [importRunsLoading, setImportRunsLoading] = useState(false);
    const [importRuns, setImportRuns] = useState<CsvImportRun[]>([]);
    const [importError, setImportError] = useState('');
    const [error, setError] = useState<string>('');

    const loadTitles = () => {
        fetch('/list')
            .then(res => { if (!res.ok) throw new Error(`Failed to load titles (${res.status})`); return res.json(); })
            .then(data => setTitles(data.titles ?? []))
            .catch(e => setError(String(e.message ?? e)));
    };

    const loadPublishers = () => {
        fetch('/publishers')
            .then(res => { if (!res.ok) throw new Error(`Failed to load publishers (${res.status})`); return res.json(); })
            .then(data => setPublishers(data.publishers ?? []))
            .catch(e => setError(String(e.message ?? e)));
    };

    const loadSeries = (titleId: number | null, onLoaded: (rows: SeriesItem[]) => void) => {
        const params = new URLSearchParams();
        if (titleId) {
            params.set('titleId', String(titleId));
        }
        const query = params.toString();
        fetch(`/series${query ? `?${query}` : ''}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load series (${res.status})`); return res.json(); })
            .then(data => onLoaded(data.series ?? []))
            .catch(e => setError(String(e.message ?? e)));
    };

    const loadIssues = (titleId: number | null, seriesId: number | null) => {
        const params = new URLSearchParams();
        if (titleId) {
            params.set('titleId', String(titleId));
        }
        if (seriesId) {
            params.set('seriesId', String(seriesId));
        }
        const query = params.toString();
        fetch(`/issues${query ? `?${query}` : ''}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load issues (${res.status})`); return res.json(); })
            .then(data => setIssueList(data.issues ?? []))
            .catch(e => setError(String(e.message ?? e)));
    };

    useEffect(() => {
        loadPublishers();
        loadTitles();
        loadSeries(null, setSeriesList);
        loadSeries(null, setIssueSeriesList);
        loadIssues(null, null);
    }, []);

    const refreshAllEntityLists = () => {
        loadPublishers();
        loadTitles();
        loadSeries(seriesFilterTitleId, setSeriesList);
        loadSeries(issuesFilterTitleId, setIssueSeriesList);
        loadIssues(issuesFilterTitleId, issuesFilterSeriesId);
    };

    const handleSeriesFilterTitleChange = (titleId: number | null) => {
        setSeriesFilterTitleId(titleId);
        setSelectedSeriesId(null);
        loadSeries(titleId, setSeriesList);
    };

    const handleIssuesFilterTitleChange = (titleId: number | null) => {
        setIssuesFilterTitleId(titleId);
        setIssuesFilterSeriesId(null);
        setSelectedIssueId(null);
        loadSeries(titleId, setIssueSeriesList);
        loadIssues(titleId, null);
    };

    const handleIssuesFilterSeriesChange = (seriesId: number | null) => {
        setIssuesFilterSeriesId(seriesId);
        setSelectedIssueId(null);
        loadIssues(issuesFilterTitleId, seriesId);
    };

    const handleLoadTitle = () => {
        if (!selectedTitleId) { setError('Please select a title first'); return; }
        setError('');
        loadTitles();
        setView({ mode: 'editTitle', titleId: selectedTitleId });
    };

    const handleLoadPublisher = () => {
        if (!selectedPublisherId) { setError('Please select a publisher first'); return; }
        setError('');
        loadPublishers();
        setView({ mode: 'editPublisher', publisherId: selectedPublisherId });
    };

    const handleLoadSeries = () => {
        if (!selectedSeriesId) { setError('Please select a series first'); return; }
        setError('');
        setView({ mode: 'editSeries', seriesId: selectedSeriesId });
    };

    const handleLoadIssue = () => {
        if (!selectedIssueId) { setError('Please select an issue first'); return; }
        setError('');
        setView({ mode: 'editIssue', issueId: selectedIssueId });
    };

    const switchTab = (tab: AdminTab) => {
        setActiveTab(tab);
        setError('');
        setView({ mode: 'idle' });
    };

    const runImportPreview = async () => {
        if (!importFile) {
            setImportError('Please choose a CSV file first.');
            return;
        }
        setImportLoading(true);
        setImportError('');
        setImportPreview(null);
        setImportCommitResult(null);
        setImportLoggedSkippedRows(null);
        try {
            const csvText = await importFile.text();
            const response = await fetch('/import/csv/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    csvText,
                    delimiter: importDelimiter,
                    hasHeader: importHasHeader,
                    mapping: importColumnMapping,
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to preview CSV import (${response.status})`);
            }
            const payload: CsvImportPreview = await response.json();
            if (payload.error) {
                throw new Error(payload.error);
            }
            setImportPreview(payload);
            let hasExistingMappings = false;
            for (const columnName in importColumnMapping) {
                if (Object.prototype.hasOwnProperty.call(importColumnMapping, columnName) && importColumnMapping[columnName] !== '') {
                    hasExistingMappings = true;
                    break;
                }
            }
            if (!hasExistingMappings) {
                const initialMapping: CsvImportColumnMapping = {};
                payload.headers.forEach(header => {
                    initialMapping[header] = '';
                });
                payload.resolvedMapping.forEach(mapping => {
                    initialMapping[mapping.column] = mapping.field;
                });
                setImportColumnMapping(initialMapping);
            }
        } catch (e) {
            setImportError(String((e as Error).message ?? e));
        } finally {
            setImportLoading(false);
        }
    };

    const runImportCommit = async () => {
        if (!importFile) {
            setImportError('Please choose a CSV file first.');
            return;
        }
        if (!importPreview) {
            setImportError('Run preview before commit.');
            return;
        }
        setImportCommitLoading(true);
        setImportError('');
        setImportCommitResult(null);
        setImportLoggedSkippedRows(null);
        try {
            const csvText = await importFile.text();
            const response = await fetch('/import/csv/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    csvText,
                    delimiter: importDelimiter,
                    hasHeader: importHasHeader,
                    mapping: importColumnMapping,
                    mode: importMode,
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to commit CSV import (${response.status})`);
            }
            const payload: CsvImportCommitResult = await response.json();
            if (payload.error) {
                throw new Error(payload.error);
            }
            setImportCommitResult(payload);
            await loadSkippedRowsFromLog(payload.runId);
            await loadImportRuns();
            loadTitles();
            loadSeries(seriesFilterTitleId, setSeriesList);
            loadIssues(issuesFilterTitleId, issuesFilterSeriesId);
        } catch (e) {
            setImportError(String((e as Error).message ?? e));
        } finally {
            setImportCommitLoading(false);
        }
    };

    const loadSkippedRowsFromLog = async (runId: string) => {
        setImportSkippedRowsLoading(true);
        try {
            const response = await fetch(`/import/csv/skipped/${encodeURIComponent(runId)}?limit=500`);
            if (!response.ok) {
                throw new Error(`Failed to load skipped rows (${response.status})`);
            }
            const payload: CsvImportSkippedRowsResponse = await response.json();
            setImportLoggedSkippedRows(payload);
        } catch (e) {
            setImportError(String((e as Error).message ?? e));
        } finally {
            setImportSkippedRowsLoading(false);
        }
    };

    const loadImportRuns = async () => {
        setImportRunsLoading(true);
        try {
            const response = await fetch('/import/csv/runs?limit=50');
            if (!response.ok) {
                throw new Error(`Failed to load import history (${response.status})`);
            }
            const payload: CsvImportRunsResponse = await response.json();
            setImportRuns(payload.runs ?? []);
        } catch (e) {
            setImportError(String((e as Error).message ?? e));
        } finally {
            setImportRunsLoading(false);
        }
    };

    const confidenceClassName = (confidence: CsvImportMappingSuggestion['confidence']): string => {
        if (confidence === 'exact') {
            return 'badge text-bg-success';
        }
        if (confidence === 'alias') {
            return 'badge text-bg-warning';
        }
        return 'badge text-bg-secondary';
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-sm-12">
                    <h3 className="page-header">[ Artichoke, Comic Book Database &gt;&gt; Administration Panel ]</h3>
                    <div className="page-header-menu"><a className="btn btn-warning" href="/">Catalog</a></div>
                </div>
            </div>

            <div className="row">
                <div className="col-3" id="left-menu">
                    <div id="admin-titles-list">
                        <div className="mb-3 btn-group w-100" role="group" aria-label="Admin sections">
                            <button type="button" className={`btn btn-sm ${activeTab === 'publishers' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => switchTab('publishers')}>Publishers</button>
                            <button type="button" className={`btn btn-sm ${activeTab === 'titles' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => switchTab('titles')}>Titles</button>
                            <button type="button" className={`btn btn-sm ${activeTab === 'series' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => switchTab('series')}>Series</button>
                            <button type="button" className={`btn btn-sm ${activeTab === 'issues' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => switchTab('issues')}>Issues</button>
                            <button type="button" className={`btn btn-sm ${activeTab === 'import' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => switchTab('import')}>Import</button>
                        </div>

                        {activeTab === 'publishers' && (
                            <div className="mb-3">
                                <h6>Publishers</h6>
                                <select
                                    className="form-select mb-2"
                                    value={selectedPublisherId ?? ''}
                                    onChange={e => setSelectedPublisherId(Number(e.target.value) || null)}
                                >
                                    <option value="">-- select a publisher --</option>
                                    {publishers.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <button className="btn btn-primary btn-sm me-1" onClick={handleLoadPublisher}>Load Publisher</button>
                                <button className="btn btn-warning btn-sm" onClick={() => { setError(''); setView({ mode: 'newPublisher' }); }}>New Publisher</button>
                            </div>
                        )}

                        {activeTab === 'titles' && (
                            <div className="mb-3">
                                <h6>Titles</h6>
                                <select
                                    className="form-select mb-2"
                                    value={selectedTitleId ?? ''}
                                    onChange={e => setSelectedTitleId(Number(e.target.value) || null)}
                                >
                                    <option value="">-- select a title --</option>
                                    {titles.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <button className="btn btn-primary btn-sm me-1" onClick={handleLoadTitle}>Load Title</button>
                                <button className="btn btn-warning btn-sm" onClick={() => { setError(''); setView({ mode: 'newTitle' }); }}>New Title</button>
                            </div>
                        )}

                        {activeTab === 'series' && (
                            <div className="mb-3">
                                <h6>Series</h6>
                                <label className="form-label" htmlFor="series-title-filter">Title filter</label>
                                <select
                                    id="series-title-filter"
                                    className="form-select mb-2"
                                    value={seriesFilterTitleId ?? ''}
                                    onChange={e => handleSeriesFilterTitleChange(Number(e.target.value) || null)}
                                >
                                    <option value="">-- all titles --</option>
                                    {titles.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <select
                                    className="form-select mb-2"
                                    value={selectedSeriesId ?? ''}
                                    onChange={e => setSelectedSeriesId(Number(e.target.value) || null)}
                                >
                                    <option value="">-- select a series --</option>
                                    {seriesList.map(s => (
                                        <option key={s.id} value={s.id}>{formatSeriesLabel(s)}</option>
                                    ))}
                                </select>
                                <button className="btn btn-primary btn-sm me-1" onClick={handleLoadSeries}>Load Series</button>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => {
                                        if (!seriesFilterTitleId) { setError('Select a title filter before creating a series.'); return; }
                                        setError('');
                                        setView({ mode: 'newSeries', titleId: seriesFilterTitleId });
                                    }}
                                >
                                    New Series
                                </button>
                            </div>
                        )}

                        {activeTab === 'issues' && (
                            <div className="mb-3">
                                <h6>Issues</h6>
                                <label className="form-label" htmlFor="issues-title-filter">Title filter</label>
                                <select
                                    id="issues-title-filter"
                                    className="form-select mb-2"
                                    value={issuesFilterTitleId ?? ''}
                                    onChange={e => handleIssuesFilterTitleChange(Number(e.target.value) || null)}
                                >
                                    <option value="">-- all titles --</option>
                                    {titles.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <label className="form-label" htmlFor="issues-series-filter">Series filter</label>
                                <select
                                    id="issues-series-filter"
                                    className="form-select mb-2"
                                    value={issuesFilterSeriesId ?? ''}
                                    onChange={e => handleIssuesFilterSeriesChange(Number(e.target.value) || null)}
                                >
                                    <option value="">-- all series --</option>
                                    {issueSeriesList.map(s => (
                                        <option key={s.id} value={s.id}>{formatSeriesLabel(s)}</option>
                                    ))}
                                </select>
                                <select
                                    className="form-select mb-2"
                                    value={selectedIssueId ?? ''}
                                    onChange={e => setSelectedIssueId(Number(e.target.value) || null)}
                                >
                                    <option value="">-- select an issue --</option>
                                    {issueList.map(i => (
                                        <option key={i.id} value={i.id}>{i.titleName} / {i.seriesName} #{i.number}</option>
                                    ))}
                                </select>
                                <button className="btn btn-primary btn-sm me-1" onClick={handleLoadIssue}>Load Issue</button>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => {
                                        if (!issuesFilterSeriesId) { setError('Select a series filter before creating an issue.'); return; }
                                        setError('');
                                        setView({ mode: 'newIssue', seriesId: issuesFilterSeriesId });
                                    }}
                                >
                                    New Issue
                                </button>
                            </div>
                        )}

                        {activeTab === 'import' && (
                            <div className="mb-3">
                                <h6>CSV Import (Stage 2: Preview + Validation)</h6>
                                <div className="mb-2">
                                    <label className="form-label" htmlFor="import-file">CSV file</label>
                                    <input
                                        id="import-file"
                                        type="file"
                                        className="form-control"
                                        accept=".csv,text/csv"
                                        onChange={e => {
                                            const file = e.target.files?.[0] ?? null;
                                            setImportFile(file);
                                            setImportPreview(null);
                                            setImportColumnMapping({});
                                            setImportError('');
                                        }}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label" htmlFor="import-delimiter">Delimiter</label>
                                    <select
                                        id="import-delimiter"
                                        className="form-select"
                                        value={importDelimiter}
                                        onChange={e => setImportDelimiter(e.target.value)}
                                    >
                                        <option value=",">Comma (,)</option>
                                        <option value=";">Semicolon (;)</option>
                                        <option value="\t">Tab (\t)</option>
                                        <option value="|">Pipe (|)</option>
                                    </select>
                                </div>
                                <div className="form-check mb-2">
                                    <input
                                        id="import-has-header"
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={importHasHeader}
                                        onChange={e => {
                                            setImportHasHeader(e.target.checked);
                                            setImportPreview(null);
                                            setImportColumnMapping({});
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="import-has-header">
                                        First row contains headers
                                    </label>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={runImportPreview} disabled={importLoading || !importFile}>
                                    {importLoading ? 'Previewing…' : 'Preview Mapping'}
                                </button>
                                <div className="mt-2">
                                    <label className="form-label" htmlFor="import-mode">Import mode</label>
                                    <select
                                        id="import-mode"
                                        className="form-select form-select-sm"
                                        value={importMode}
                                        onChange={e => setImportMode(e.target.value as CsvImportMode)}
                                    >
                                        <option value="upsert">Upsert (insert + update existing)</option>
                                        <option value="create-only">Create only (skip existing issues)</option>
                                        <option value="dry-run">Dry run (no writes)</option>
                                    </select>
                                </div>
                                <button
                                    className="btn btn-success btn-sm mt-2"
                                    onClick={runImportCommit}
                                    disabled={importCommitLoading || !importFile || !importPreview}
                                >
                                    {importCommitLoading ? 'Committing…' : 'Commit Import'}
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm mt-2 ms-2"
                                    onClick={loadImportRuns}
                                    disabled={importRunsLoading}
                                >
                                    {importRunsLoading ? 'Loading history…' : 'Load Import History'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-9">
                    {error && <div className="alert alert-warning">{error}</div>}
                    {view.mode === 'idle' && activeTab !== 'import' && <p className="text-muted">Choose an admin tab and load an item to edit.</p>}
                    {activeTab === 'import' && view.mode === 'idle' && (
                        <div>
                            <p className="text-muted mb-2">Upload a CSV to preview detected columns and suggested field mapping. No database writes happen in this step.</p>
                            {importError && <div className="alert alert-danger">{importError}</div>}
                            {importCommitResult && (
                                <div className="alert alert-success">
                                    <div><strong>Run ID:</strong> <code>{importCommitResult.runId}</code></div>
                                    <div><strong>Import mode:</strong> {importCommitResult.summary.mode}</div>
                                    <div><strong>Rows:</strong> {importCommitResult.summary.rowCount} total, {importCommitResult.summary.validRows} valid, {importCommitResult.summary.errorRows} errors, {importCommitResult.summary.warningRows} warnings</div>
                                    <div><strong>Changes:</strong> {importCommitResult.summary.insertedTitles} titles inserted, {importCommitResult.summary.insertedSeries} series inserted, {importCommitResult.summary.updatedSeries} series updated, {importCommitResult.summary.insertedIssues} issues inserted, {importCommitResult.summary.updatedIssues} issues updated, {importCommitResult.summary.skippedExistingIssues} existing issues skipped, {importCommitResult.summary.skippedInvalidRows} invalid rows skipped</div>
                                    <div><strong>Logged skipped rows:</strong> {importCommitResult.loggedSkippedRows}</div>
                                    <button
                                        className="btn btn-outline-success btn-sm mt-2"
                                        onClick={() => loadSkippedRowsFromLog(importCommitResult.runId)}
                                        disabled={importSkippedRowsLoading}
                                    >
                                        {importSkippedRowsLoading ? 'Loading skipped rows…' : 'Reload skipped rows from log'}
                                    </button>
                                    <a
                                        className="btn btn-outline-success btn-sm mt-2 ms-2"
                                        href={`/import/csv/skipped/${encodeURIComponent(importCommitResult.runId)}/export?limit=2000`}
                                    >
                                        Export skipped rows CSV
                                    </a>
                                    {importCommitResult.message && <div><strong>Note:</strong> {importCommitResult.message}</div>}
                                </div>
                            )}
                            {importLoggedSkippedRows && importLoggedSkippedRows.rows.length > 0 && (
                                <div className="mt-3">
                                    <h6>Skipped Rows Log ({importLoggedSkippedRows.count} rows)</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Row</th>
                                                    <th>Errors</th>
                                                    <th>Warnings</th>
                                                    <th>Normalized Snapshot</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importLoggedSkippedRows.rows.map(row => (
                                                    <tr key={`logged-skip-${row.id}`}>
                                                        <td>{row.rowNumber}</td>
                                                        <td>{row.errors}</td>
                                                        <td>{row.warnings ?? <span className="text-muted">None</span>}</td>
                                                        <td><code>{JSON.stringify(row.normalized ?? {})}</code></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {importRuns.length > 0 && (
                                <div className="mt-3">
                                    <h6>Import History</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Run ID</th>
                                                    <th>Created</th>
                                                    <th>Mode</th>
                                                    <th>Rows</th>
                                                    <th>Issues</th>
                                                    <th>Skipped Invalid</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importRuns.map(run => (
                                                    <tr key={run.runId}>
                                                        <td><code>{run.runId}</code></td>
                                                        <td>{run.createdAt}</td>
                                                        <td>{run.mode}</td>
                                                        <td>{run.totalRows} total / {run.errorRows} errors</td>
                                                        <td>{run.insertedIssues} inserted / {run.updatedIssues} updated / {run.skippedExistingIssues} existing</td>
                                                        <td>{run.skippedInvalidRows}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-outline-primary btn-sm me-2"
                                                                onClick={() => loadSkippedRowsFromLog(run.runId)}
                                                                disabled={importSkippedRowsLoading}
                                                            >
                                                                Load Skipped
                                                            </button>
                                                            <a
                                                                className="btn btn-outline-primary btn-sm"
                                                                href={`/import/csv/skipped/${encodeURIComponent(run.runId)}/export?limit=2000`}
                                                            >
                                                                Export CSV
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {importPreview && (
                                <div>
                                    <div className="alert alert-info">
                                        Detected <strong>{importPreview.rowCount}</strong> rows and <strong>{importPreview.headers.length}</strong> columns.
                                    </div>
                                    <div className="alert alert-secondary">
                                        Valid rows: <strong>{importPreview.validation.validRows}</strong> | Warning rows: <strong>{importPreview.validation.warningRows}</strong> | Error rows: <strong>{importPreview.validation.errorRows}</strong>
                                    </div>
                                    {importPreview.warnings.length > 0 && (
                                        <div className="alert alert-warning">
                                            {importPreview.warnings.map((warning, index) => (
                                                <div key={`${warning}-${index}`}>{warning}</div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <h6>Suggested Mapping</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-bordered align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>CSV Column</th>
                                                        <th>Mapped Field</th>
                                                        <th>Confidence</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importPreview.mappingSuggestions.map((suggestion, index) => (
                                                        <tr key={`${suggestion.column}-${index}`}>
                                                            <td>{suggestion.column}</td>
                                                            <td>
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={importColumnMapping[suggestion.column] ?? ''}
                                                                    onChange={e => {
                                                                        const nextValue = e.target.value;
                                                                        setImportColumnMapping(prev => ({
                                                                            ...prev,
                                                                            [suggestion.column]: nextValue,
                                                                        }));
                                                                    }}
                                                                >
                                                                    <option value="">-- unmapped --</option>
                                                                    {importPreview.canonicalFields.map(field => (
                                                                        <option key={field.key} value={field.key}>
                                                                            {field.label} ({field.key})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td><span className={confidenceClassName(suggestion.confidence)}>{suggestion.confidence}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <button className="btn btn-outline-primary btn-sm mt-2" onClick={runImportPreview} disabled={importLoading || !importFile}>
                                            Re-run Validation with Mapping
                                        </button>
                                    </div>
                                    {importPreview.resolvedMapping.length > 0 && (
                                        <div className="mb-3">
                                            <h6>Resolved Field Mapping</h6>
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Artichoke Field</th>
                                                            <th>CSV Column</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {importPreview.resolvedMapping.map(mapping => (
                                                            <tr key={mapping.field}>
                                                                <td><code>{mapping.field}</code></td>
                                                                <td>{mapping.column}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <h6>Canonical Artichoke Import Fields</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-bordered align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Field Key</th>
                                                        <th>Label</th>
                                                        <th>Required</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importPreview.canonicalFields.map(field => (
                                                        <tr key={field.key}>
                                                            <td><code>{field.key}</code></td>
                                                            <td>{field.label}</td>
                                                            <td>{field.required ? 'Yes' : 'No'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div>
                                        <h6>Sample Rows (first {importPreview.sampleRows.length})</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-striped table-bordered align-middle">
                                                <thead>
                                                    <tr>
                                                        {importPreview.headers.map(header => (
                                                            <th key={header}>{header}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importPreview.sampleRows.map((row, rowIndex) => (
                                                        <tr key={`sample-${rowIndex}`}>
                                                            {importPreview.headers.map(header => (
                                                                <td key={`${rowIndex}-${header}`}>{row[header] ?? ''}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {importPreview.errorFindings.length > 0 && (
                                        <div className="mt-3">
                                            <h6>Error Findings (showing {importPreview.validation.sampledErrorFindings} of max {importPreview.validation.sampledErrorFindingLimit})</h6>
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Row</th>
                                                            <th>Errors</th>
                                                            <th>Normalized Snapshot</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {importPreview.errorFindings.map(finding => (
                                                            <tr key={`finding-${finding.rowNumber}`}>
                                                                <td>{finding.rowNumber}</td>
                                                                <td>
                                                                    {finding.errors.length === 0 ? <span className="text-muted">None</span> : finding.errors.join(' | ')}
                                                                </td>
                                                                <td>
                                                                    <code>{JSON.stringify(finding.normalized)}</code>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    {importPreview.warningFindings.length > 0 && (
                                        <div className="mt-3">
                                            <h6>Warning Findings (showing {importPreview.validation.sampledWarningFindings} of max {importPreview.validation.sampledWarningFindingLimit})</h6>
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Row</th>
                                                            <th>Warnings</th>
                                                            <th>Normalized Snapshot</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {importPreview.warningFindings.map(finding => (
                                                            <tr key={`warning-${finding.rowNumber}`}>
                                                                <td>{finding.rowNumber}</td>
                                                                <td>
                                                                    {finding.warnings.length === 0 ? <span className="text-muted">None</span> : finding.warnings.join(' | ')}
                                                                </td>
                                                                <td>
                                                                    <code>{JSON.stringify(finding.normalized)}</code>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {view.mode === 'editPublisher' && (
                        <PublisherEditor
                            publisherId={view.publisherId}
                            onSaved={() => {
                                refreshAllEntityLists();
                                setActiveTab('publishers');
                            }}
                            onDeleted={() => {
                                refreshAllEntityLists();
                                setSelectedPublisherId(null);
                                setView({ mode: 'idle' });
                            }}
                        />
                    )}
                    {view.mode === 'newPublisher' && (
                        <PublisherCreator
                            onCreated={(id) => {
                                refreshAllEntityLists();
                                setSelectedPublisherId(id);
                                setView({ mode: 'editPublisher', publisherId: id });
                            }}
                            onCancel={() => setView({ mode: 'idle' })}
                        />
                    )}
                    {view.mode === 'editTitle' && (
                        <TitleEditor
                            titleId={view.titleId}
                            onSaved={() => {
                                refreshAllEntityLists();
                                setActiveTab('titles');
                            }}
                            onDeleted={() => {
                                refreshAllEntityLists();
                                setSelectedTitleId(null);
                                setView({ mode: 'idle' });
                            }}
                        />
                    )}
                    {view.mode === 'newTitle' && (
                        <TitleCreator
                            onCreated={(id) => {
                                refreshAllEntityLists();
                                setSelectedTitleId(id);
                                setView({ mode: 'editTitle', titleId: id });
                            }}
                            onCancel={() => setView({ mode: 'idle' })}
                        />
                    )}
                    {view.mode === 'editSeries' && (
                        <SeriesEditor
                            seriesId={view.seriesId}
                            onSaved={() => {
                                refreshAllEntityLists();
                                setActiveTab('series');
                            }}
                            onDeleted={() => {
                                refreshAllEntityLists();
                                setSelectedSeriesId(null);
                                setView({ mode: 'idle' });
                            }}
                        />
                    )}
                    {view.mode === 'newSeries' && (
                        <SeriesCreator
                            titleId={view.titleId}
                            onCreated={(id) => {
                                refreshAllEntityLists();
                                setSelectedSeriesId(id);
                                setView({ mode: 'editSeries', seriesId: id });
                            }}
                            onCancel={() => setView({ mode: 'idle' })}
                        />
                    )}
                    {view.mode === 'editIssue' && (
                        <IssueEditor
                            issueId={view.issueId}
                            onSaved={() => {
                                refreshAllEntityLists();
                                setActiveTab('issues');
                            }}
                            onDeleted={() => {
                                refreshAllEntityLists();
                                setSelectedIssueId(null);
                                setView({ mode: 'idle' });
                            }}
                        />
                    )}
                    {view.mode === 'newIssue' && (
                        <IssueCreator
                            seriesId={view.seriesId}
                            onCreated={(id) => {
                                refreshAllEntityLists();
                                setSelectedIssueId(id);
                                setView({ mode: 'editIssue', issueId: id });
                            }}
                            onCancel={() => setView({ mode: 'idle' })}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminApp;

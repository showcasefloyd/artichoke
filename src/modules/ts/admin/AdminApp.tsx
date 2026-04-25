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

type AdminTab = 'publishers' | 'titles' | 'series' | 'issues';

interface SeriesItem {
    id: number;
    titleId: number;
    name: string;
    volume?: number;
    startYear?: number;
    publisher: string;
    titleName: string;
}

function formatSeriesLabel(series: SeriesItem): string {
    const volumePart = series.volume ? ` (Vol ${series.volume})` : '';
    const yearPart = series.startYear ? ` ${series.startYear}` : '';
    return `${series.titleName}: ${series.name}${volumePart}${yearPart}`;
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
                    </div>
                </div>

                <div className="col-9">
                    {error && <div className="alert alert-warning">{error}</div>}
                    {view.mode === 'idle' && <p className="text-muted">Choose an admin tab and load an item to edit.</p>}
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

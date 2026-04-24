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

interface SeriesBook {
    id: number;
    title: string;
}

interface IssueItem {
    issue: string;
    own: string;
    issue_id: number;
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

const AdminApp: React.FC = () => {
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [selectedPublisherId, setSelectedPublisherId] = useState<number | null>(null);
    const [titles, setTitles] = useState<Title[]>([]);
    const [selectedTitleId, setSelectedTitleId] = useState<number | null>(null);
    const [seriesList, setSeriesList] = useState<SeriesBook[]>([]);
    const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
    const [issueList, setIssueList] = useState<IssueItem[]>([]);
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

    const loadSeries = (titleId: number) => {
        fetch(`/list/${titleId}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load series (${res.status})`); return res.json(); })
            .then(data => setSeriesList((data.series ?? []).filter((s: SeriesBook) => s.id !== 0)))
            .catch(e => setError(String(e.message ?? e)));
    };

    const loadIssues = (seriesId: number) => {
        fetch(`/issues/${seriesId}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load issues (${res.status})`); return res.json(); })
            .then(data => setIssueList(data ?? []))
            .catch(e => setError(String(e.message ?? e)));
    };

    useEffect(() => {
        loadPublishers();
        loadTitles();
    }, []);

    const handleTitleSelect = (id: number | null) => {
        setSelectedTitleId(id);
        setSeriesList([]);
        setSelectedSeriesId(null);
        setIssueList([]);
        if (id) loadSeries(id);
    };

    const handleSeriesSelect = (id: number) => {
        setSelectedSeriesId(id);
        setIssueList([]);
        loadIssues(id);
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

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-sm-12">
                    <h3 className="page-header">[ Artichoke, Comic Book Database &gt;&gt; Administration Panel ]</h3>
                    <div className="page-header-menu"><a href="/">Catalog</a></div>
                </div>
            </div>

            <div className="row">
                <div className="col-3" id="left-menu">
                    <div id="admin-titles-list">
                        <div className="mb-3">
                            <select
                                className="form-select"
                                value={selectedPublisherId ?? ''}
                                onChange={e => setSelectedPublisherId(Number(e.target.value) || null)}
                            >
                                <option value="">-- select a publisher --</option>
                                {publishers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <h6>Publishers</h6>
                            <button className="btn btn-primary btn-sm me-1" onClick={handleLoadPublisher}>Load Publisher</button>
                            <button className="btn btn-warning btn-sm" onClick={() => { setError(''); setView({ mode: 'newPublisher' }); }}>New Publisher</button>
                        </div>

                        <div className="mb-3">
                            <select
                                className="form-select"
                                value={selectedTitleId ?? ''}
                                onChange={e => handleTitleSelect(Number(e.target.value) || null)}
                            >
                                <option value="">-- select a title --</option>
                                {titles.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <h6>Titles</h6>
                            <button className="btn btn-primary btn-sm me-1" onClick={handleLoadTitle}>Load Title</button>
                            <button className="btn btn-warning btn-sm" onClick={() => { setError(''); setView({ mode: 'newTitle' }); }}>New Title</button>
                        </div>

                        {selectedTitleId && (
                            <div className="mb-3">
                                <h6>Series</h6>
                                {seriesList.length > 0 && (
                                    <ul className="list-unstyled mb-2">
                                        {seriesList.map(s => (
                                            <li key={s.id}>
                                                <a href="#" onClick={e => { e.preventDefault(); setError(''); handleSeriesSelect(s.id); setView({ mode: 'editSeries', seriesId: s.id }); }}>{s.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button className="btn btn-warning btn-sm" onClick={() => { setError(''); setView({ mode: 'newSeries', titleId: selectedTitleId }); }}>New Series</button>
                            </div>
                        )}

                        {selectedSeriesId && (
                            <div className="mb-3">
                                <h6>Issues</h6>
                                {issueList.length > 0 && (
                                    <ul className="issues-div mb-2">
                                        {issueList.map(i => (
                                            <li key={i.issue_id}>
                                                <a href="#" onClick={e => { e.preventDefault(); setError(''); setView({ mode: 'editIssue', issueId: i.issue_id }); }}>#{i.issue}</a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button className="btn btn-warning btn-sm" onClick={() => { setError(''); setView({ mode: 'newIssue', seriesId: selectedSeriesId }); }}>New Issue</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-9">
                    {error && <div className="alert alert-warning">{error}</div>}
                    {view.mode === 'idle' && <p className="text-muted">Select a title from the list to get started.</p>}
                    {view.mode === 'editPublisher' && (
                        <PublisherEditor
                            publisherId={view.publisherId}
                            onSaved={() => loadPublishers()}
                            onDeleted={() => { loadPublishers(); setSelectedPublisherId(null); setView({ mode: 'idle' }); }}
                        />
                    )}
                    {view.mode === 'newPublisher' && (
                        <PublisherCreator
                            onCreated={(id) => { loadPublishers(); setSelectedPublisherId(id); setView({ mode: 'editPublisher', publisherId: id }); }}
                            onCancel={() => setView({ mode: 'idle' })}
                        />
                    )}
                    {view.mode === 'editTitle' && (
                        <TitleEditor
                            titleId={view.titleId}
                            onSaved={() => loadTitles()}
                            onDeleted={() => { loadTitles(); setSelectedTitleId(null); setView({ mode: 'idle' }); }}
                        />
                    )}
                    {view.mode === 'newTitle' && (
                        <TitleCreator
                            onCreated={(id, name) => { loadTitles(); setSelectedTitleId(id); setView({ mode: 'editTitle', titleId: id }); }}
                            onCancel={() => setView({ mode: 'idle' })}
                        />
                    )}
                    {view.mode === 'editSeries' && (
                        <SeriesEditor
                            seriesId={view.seriesId}
                            onSaved={() => { if (selectedTitleId) loadSeries(selectedTitleId); }}
                            onDeleted={() => { if (selectedTitleId) loadSeries(selectedTitleId); setSelectedSeriesId(null); setIssueList([]); setView({ mode: 'idle' }); }}
                        />
                    )}
                    {view.mode === 'newSeries' && (
                        <SeriesCreator
                            titleId={view.titleId}
                            onCreated={(id) => { if (selectedTitleId) loadSeries(selectedTitleId); handleSeriesSelect(id); setView({ mode: 'editSeries', seriesId: id }); }}
                            onCancel={() => setView({ mode: 'idle' })}
                        />
                    )}
                    {view.mode === 'editIssue' && (
                        <IssueEditor
                            issueId={view.issueId}
                            onSaved={() => { if (selectedSeriesId) loadIssues(selectedSeriesId); }}
                            onDeleted={() => { if (selectedSeriesId) loadIssues(selectedSeriesId); setView({ mode: 'idle' }); }}
                        />
                    )}
                    {view.mode === 'newIssue' && (
                        <IssueCreator
                            seriesId={view.seriesId}
                            onCreated={(id) => { if (selectedSeriesId) loadIssues(selectedSeriesId); setView({ mode: 'editIssue', issueId: id }); }}
                            onCancel={() => setView({ mode: 'idle' })}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminApp;

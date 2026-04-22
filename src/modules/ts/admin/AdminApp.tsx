import React, { useEffect, useState } from 'react';
import TitleEditor from './TitleEditor';

export interface Title {
    id: number;
    name: string;
}

export type AdminView =
    | { mode: 'idle' }
    | { mode: 'editTitle'; titleId: number }
    | { mode: 'newTitle' }
    | { mode: 'editSeries'; seriesId: number }
    | { mode: 'newSeries'; titleId: number }
    | { mode: 'editIssue'; issueId: number }
    | { mode: 'newIssue'; seriesId: number };

const AdminApp: React.FC = () => {
    const [titles, setTitles] = useState<Title[]>([]);
    const [selectedTitleId, setSelectedTitleId] = useState<number | null>(null);
    const [view, setView] = useState<AdminView>({ mode: 'idle' });
    const [error, setError] = useState<string>('');

    const loadTitles = () => {
        fetch('/list')
            .then(res => res.json())
            .then(data => setTitles(data.titles ?? []));
    };

    useEffect(() => { loadTitles(); }, []);

    const handleLoadTitle = () => {
        if (!selectedTitleId) { setError('Please select a title first'); return; }
        setError('');
        setView({ mode: 'editTitle', titleId: selectedTitleId });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-12">
                    <h3 className="page-header">[ Artichoke, Comic Book Database &gt;&gt; Administration Panel ]</h3>
                    <div className="page-header-menu"><a href="/">Catalog</a></div>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-3" id="left-menu">
                    <div id="admin-titles-list">
                        <div className="mb-3">
                            <select
                                className="form-select"
                                value={selectedTitleId ?? ''}
                                onChange={e => setSelectedTitleId(Number(e.target.value) || null)}
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
                                <button className="btn btn-warning btn-sm" onClick={() => { setError(''); setView({ mode: 'newSeries', titleId: selectedTitleId }); }}>New Series</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-sm-9">
                    {error && <div className="alert alert-warning">{error}</div>}
                    {view.mode === 'idle' && <p className="text-muted">Select a title from the list to get started.</p>}
                    {view.mode === 'editTitle' && (
                        <TitleEditor
                            titleId={view.titleId}
                            onSaved={() => { loadTitles(); setView({ mode: 'idle' }); }}
                            onDeleted={() => { loadTitles(); setSelectedTitleId(null); setView({ mode: 'idle' }); }}
                        />
                    )}
                    {view.mode !== 'idle' && view.mode !== 'editTitle' && <p>Panel: <strong>{view.mode}</strong> — coming next</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminApp;

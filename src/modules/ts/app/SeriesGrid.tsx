import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Issue } from './App';
import IssueDetailModal from './IssueDetailModal';
import './SeriesGrid.scss';

type ViewMode = 'full' | 'collection';

interface SeriesInfo {
    id: number;
    name: string;
    volume: number | null;
    startYear: number | null;
    totalIssues: number;
}

const SeriesGrid: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const seriesId = Number(id);

    const [seriesInfo, setSeriesInfo]   = useState<SeriesInfo | null>(null);
    const [issues, setIssues]           = useState<Issue[]>([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [viewMode, setViewMode]           = useState<ViewMode>('full');
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

    useEffect(() => {
        if (!seriesId) return;
        setLoading(true);
        setError('');

        Promise.all([
            fetch(`/series/${seriesId}`)
                .then(res => { if (!res.ok) throw new Error(`Failed to load series (${res.status})`); return res.json(); }),
            fetch(`/series/${seriesId}/issues`)
                .then(res => { if (!res.ok) throw new Error(`Failed to load issues (${res.status})`); return res.json(); }),
        ])
            .then(([seriesData, issuesData]) => {
                setSeriesInfo({
                    id:          seriesData.id,
                    name:        seriesData.name,
                    volume:      seriesData.volume ?? null,
                    startYear:   seriesData.startYear ?? null,
                    totalIssues: seriesData.totalIssues ?? 0,
                });
                setIssues(issuesData.issues ?? []);
                setLoading(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoading(false);
            });
    }, [seriesId]);

    const handleOwnedChange = useCallback((issueId: number, owned: boolean) => {
        setIssues(prev => prev.map(i => i.id === issueId ? { ...i, owned } : i));
    }, []);

    if (loading) return <div className="container py-3"><p>Loading&hellip;</p></div>;
    if (error)   return <div className="container py-3"><div className="alert alert-danger">{error}</div></div>;

    const title = seriesInfo
        ? `${seriesInfo.name}${seriesInfo.volume ? ` Vol. ${seriesInfo.volume}` : ''}${seriesInfo.startYear ? ` (${seriesInfo.startYear})` : ''}`
        : '';

    const ownedCount = issues.filter(i => i.owned).length;

    return (
        <div className="container series-grid-page">
            <div className="series-grid-back">
                <Link to="/">&larr; Back to Publishers</Link>
            </div>
            <h4>{title}</h4>
            <div className="d-flex align-items-center gap-3 mb-2">
                <p className="series-grid-meta mb-0">
                    {ownedCount} / {issues.length} issues owned
                </p>
                <div className="btn-group btn-group-sm" role="group" aria-label="View mode">
                    <button
                        type="button"
                        className={`btn ${viewMode === 'full' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('full')}
                    >
                        Full History
                    </button>
                    <button
                        type="button"
                        className={`btn ${viewMode === 'collection' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('collection')}
                    >
                        My Collection
                    </button>
                </div>
            </div>
            <div className="series-grid-cells">
                {issues.map(issue => {
                    if (viewMode === 'collection' && !issue.owned) {
                        return <div key={issue.id} className="issue-cell gap-cell" aria-hidden="true" />;
                    }
                    return (
                        <div
                            key={issue.id}
                            className={`issue-cell${issue.owned ? ' owned' : ''}`}
                            title={`#${issue.number}${issue.cover_date ? ` — ${issue.cover_date}` : ''}`}
                            onClick={() => setSelectedIssueId(issue.id)}
                            role="button"
                            aria-label={`Issue ${issue.number}${issue.owned ? ' (owned)' : ''}`}
                            style={{ cursor: 'pointer' }}
                        >
                            {issue.number}
                        </div>
                    );
                })}
            </div>
            {selectedIssueId !== null && seriesInfo && (
                <IssueDetailModal
                    issueId={selectedIssueId}
                    seriesName={seriesInfo.name}
                    initialOwned={issues.find(i => i.id === selectedIssueId)?.owned ?? false}
                    onClose={() => setSelectedIssueId(null)}
                    onOwnedChange={handleOwnedChange}
                />
            )}
        </div>
    );
};

export default SeriesGrid;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Issue } from './App';
import './SeriesGrid.scss';

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
            <p className="series-grid-meta">
                {ownedCount} / {issues.length} issues owned
            </p>
            <div className="series-grid-cells">
                {issues.map(issue => (
                    <div
                        key={issue.id}
                        className={`issue-cell${issue.owned ? ' owned' : ''}`}
                        title={`#${issue.number}${issue.cover_date ? ` — ${issue.cover_date}` : ''}`}
                    >
                        {issue.number}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeriesGrid;

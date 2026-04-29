import React, { useEffect, useState } from 'react';
import './Dashboard.scss';

interface RecentIssue {
    id: number;
    seriesName: string;
    number: string;
    cover_date: string | null;
}

interface StatsData {
    seriesCount: number;
    ownedIssueCount: number;
    recentlyAdded: RecentIssue[];
}

const Dashboard: React.FC = () => {
    const [stats, setStats]     = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        fetch('/stats')
            .then(res => { if (!res.ok) throw new Error(`Failed to load stats (${res.status})`); return res.json(); })
            .then((data: StatsData) => { setStats(data); setLoading(false); })
            .catch(e => { setError(String(e.message ?? e)); setLoading(false); });
    }, []);

    if (loading) return <div className="dashboard-strip dashboard-strip--loading">Loading&hellip;</div>;
    if (error || !stats) return null;

    return (
        <div className="dashboard-strip">
            <div className="dashboard-counts">
                <span className="dashboard-count">
                    <strong>{stats.seriesCount}</strong> series
                </span>
                <span className="dashboard-sep">·</span>
                <span className="dashboard-count">
                    <strong>{stats.ownedIssueCount}</strong> issues owned
                </span>
            </div>
            {stats.recentlyAdded.length > 0 && (
                <div className="dashboard-recent">
                    <span className="dashboard-recent-label">Recently added:</span>
                    <div className="dashboard-recent-cards">
                        {stats.recentlyAdded.map(issue => (
                            <div key={issue.id} className="dashboard-card">
                                <div className="dashboard-card-series">{issue.seriesName}</div>
                                <div className="dashboard-card-issue">#{issue.number}</div>
                                {issue.cover_date && (
                                    <div className="dashboard-card-date">{issue.cover_date}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

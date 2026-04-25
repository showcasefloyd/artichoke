import React from 'react';
import { DashboardResponse } from './App';

import './CollectorDashboard.scss';

interface Props {
    data: DashboardResponse | null;
    loading: boolean;
}

const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const CollectorDashboard: React.FC<Props> = ({ data, loading }) => {
    if (loading) {
        return <p className="collector-dashboard-loading">Loading collector dashboard...</p>;
    }

    if (!data) {
        return null;
    }

    return (
        <section className="collector-dashboard" aria-label="Collector Dashboard">
            <h4 className="collector-dashboard-title">Collector Dashboard</h4>
            <div className="row g-2 mb-3">
                <div className="col-6 col-md-3"><div className="collector-kpi"><div className="label">Publishers</div><div className="value">{data.totals.publishers}</div></div></div>
                <div className="col-6 col-md-3"><div className="collector-kpi"><div className="label">Titles</div><div className="value">{data.totals.titles}</div></div></div>
                <div className="col-6 col-md-3"><div className="collector-kpi"><div className="label">Series</div><div className="value">{data.totals.series}</div></div></div>
                <div className="col-6 col-md-3"><div className="collector-kpi"><div className="label">Issues Owned</div><div className="value">{data.totals.issuesOwned}</div></div></div>
            </div>

            <div className="row g-2">
                <div className="col-12 col-lg-4">
                    <div className="collector-panel">
                        <h5>Value Snapshot</h5>
                        <p><strong>Issue Value:</strong> {currency.format(data.values.issueValue)}</p>
                        <p><strong>Purchase Price:</strong> {currency.format(data.values.purchasePrice)}</p>
                        <p><strong>Cover Price:</strong> {currency.format(data.values.coverPrice)}</p>
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <div className="collector-panel">
                        <h5>Status Breakdown</h5>
                        <ul>
                            {data.statusBreakdown.map(item => (
                                <li key={item.status}><span>{item.status}</span><span>{item.count}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <div className="collector-panel">
                        <h5>Missing Issue Insight</h5>
                        <p><strong>Estimated Missing Issues:</strong> {data.missing.estimatedMissingIssues}</p>
                        <p><strong>Series with Gaps:</strong> {data.missing.seriesWithGaps}</p>
                    </div>
                </div>
            </div>

            <div className="row g-2 mt-1 mb-3">
                <div className="col-12 col-lg-6">
                    <div className="collector-panel">
                        <h5>Top Publishers</h5>
                        <ul>
                            {data.topPublishers.map(item => (
                                <li key={item.name}><span>{item.name}</span><span>{item.issueCount}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="collector-panel">
                        <h5>Top Titles</h5>
                        <ul>
                            {data.topTitles.map(item => (
                                <li key={item.name}><span>{item.name}</span><span>{item.issueCount}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CollectorDashboard;

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectorDashboard from '../CollectorDashboard';
import { DashboardResponse } from '../App';

const dashboardData: DashboardResponse = {
    totals: { publishers: 1, titles: 2, series: 3, issuesOwned: 4 },
    values: { issueValue: 100, purchasePrice: 80, coverPrice: 60 },
    statusBreakdown: [
        { status: 'Collected', count: 4 },
        { status: 'For Sale', count: 0 },
        { status: 'Wish List', count: 1 },
    ],
    topPublishers: [{ name: 'DC', issueCount: 3 }],
    topTitles: [{ name: 'Batman', issueCount: 2 }],
    missing: { estimatedMissingIssues: 5, seriesWithGaps: 2 },
};

describe('CollectorDashboard', () => {
    it('renders dashboard sections from payload', () => {
        render(<CollectorDashboard loading={false} data={dashboardData} />);
        expect(screen.getByRole('heading', { name: 'Collector Dashboard' })).toBeInTheDocument();
        expect(screen.getByText('Value Snapshot')).toBeInTheDocument();
        expect(screen.getByText('Status Breakdown')).toBeInTheDocument();
        expect(screen.getByText('Missing Issue Insight')).toBeInTheDocument();
        expect(screen.getByText('Top Publishers')).toBeInTheDocument();
        expect(screen.getByText('Top Titles')).toBeInTheDocument();
    });
});

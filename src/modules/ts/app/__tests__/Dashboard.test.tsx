import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';

const mockStats = {
    seriesCount: 12,
    ownedIssueCount: 247,
    recentlyAdded: [
        { id: 1, seriesName: 'Daredevil Vol. 1', number: '1', cover_date: '1964-04-01' },
        { id: 2, seriesName: 'Spider-Man',        number: '5', cover_date: '1963-10-01' },
    ],
};

function mockFetch(data: unknown, ok = true) {
    global.fetch = jest.fn().mockResolvedValue({
        ok,
        json: async () => data,
    }) as jest.Mock;
}

describe('Dashboard', () => {
    afterEach(() => jest.restoreAllMocks());

    it('renders loading state initially', () => {
        global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;
        render(<Dashboard />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders series and owned issue counts', async () => {
        mockFetch(mockStats);
        render(<Dashboard />);
        await waitFor(() => expect(screen.getByText('12')).toBeInTheDocument());
        expect(screen.getByText(/series/i)).toBeInTheDocument();
        expect(screen.getByText('247')).toBeInTheDocument();
        expect(screen.getByText(/issues owned/i)).toBeInTheDocument();
    });

    it('renders recently added issue cards', async () => {
        mockFetch(mockStats);
        render(<Dashboard />);
        await waitFor(() => expect(screen.getByText('Daredevil Vol. 1')).toBeInTheDocument());
        expect(screen.getByText('Spider-Man')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#5')).toBeInTheDocument();
    });

    it('renders nothing when fetch fails', async () => {
        mockFetch({}, false);
        const { container } = render(<Dashboard />);
        await waitFor(() => expect(container.querySelector('.dashboard-strip')).not.toBeInTheDocument());
    });

    it('skips recently added section when list is empty', async () => {
        mockFetch({ ...mockStats, recentlyAdded: [] });
        render(<Dashboard />);
        await waitFor(() => expect(screen.getByText('12')).toBeInTheDocument());
        expect(screen.queryByText(/recently added/i)).not.toBeInTheDocument();
    });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SeriesGrid from '../SeriesGrid';

const mockSeries = { id: 1, name: 'Daredevil', volume: 1, startYear: 1964, totalIssues: 3 };
const mockIssues = {
    issues: [
        { id: 101, number: '1', sort: 1, cover_date: '1964-04-01', owned: true },
        { id: 102, number: '2', sort: 2, cover_date: '1964-06-01', owned: false },
        { id: 103, number: '3', sort: 3, cover_date: '1964-08-01', owned: true },
    ],
};

const mockIssueDetail = { number: '1', storytitle: '', coverdate: '', condition: '', purchaseprice: '', purchasedate: '', priceguidevalue: '', comments: '', status: 'Collected' };

function mockFetch(overrides: Record<string, unknown> = {}) {
    global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
        if (url === '/series/1') return Promise.resolve({ ok: true, json: async () => mockSeries });
        if (url === '/series/1/issues') return Promise.resolve({ ok: true, json: async () => mockIssues });
        if (/^\/issue\/\d+$/.test(url)) return Promise.resolve({ ok: true, json: async () => ({ ...mockIssueDetail, ...overrides }) });
        if (url.startsWith('/issues/') && url.endsWith('/owned') && opts?.method === 'PUT') {
            const issueId = parseInt(url.split('/')[2]);
            return Promise.resolve({ ok: true, json: async () => ({ id: issueId, owned: true, ...overrides }) });
        }
        return Promise.reject(new Error('Unexpected URL: ' + url));
    }) as jest.Mock;
}

function renderGrid() {
    render(
        <MemoryRouter initialEntries={['/view/series/1']}>
            <Routes>
                <Route path="/view/series/:id" element={<SeriesGrid />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('SeriesGrid', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders a loading state initially', () => {
        global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;
        renderGrid();
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders the series title and issue cells', async () => {
        mockFetch();
        renderGrid();
        await waitFor(() => expect(screen.getByText(/Daredevil Vol\. 1 \(1964\)/)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: /issue 1/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /issue 2/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /issue 3/i })).toBeInTheDocument();
    });

    it('shows owned count summary', async () => {
        mockFetch();
        renderGrid();
        await waitFor(() => expect(screen.getByText(/2 \/ 3 issues owned/i)).toBeInTheDocument());
    });

    it('shows Full History and My Collection toggle buttons', async () => {
        mockFetch();
        renderGrid();
        await waitFor(() => expect(screen.getByRole('button', { name: /full history/i })).toBeInTheDocument());
        expect(screen.getByRole('button', { name: /my collection/i })).toBeInTheDocument();
    });

    it('My Collection mode shows gap cells for unowned issues', async () => {
        mockFetch();
        renderGrid();
        await waitFor(() => expect(screen.getByRole('button', { name: /full history/i })).toBeInTheDocument());

        // Switch to My Collection
        await userEvent.click(screen.getByRole('button', { name: /my collection/i }));

        // Issue 2 is unowned — it should become a hidden gap cell (aria-hidden)
        const gapCells = document.querySelectorAll('.gap-cell');
        expect(gapCells.length).toBe(1);

        // Owned issues 1 and 3 should still be visible as buttons
        expect(screen.getByRole('button', { name: /issue 1/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /issue 3/i })).toBeInTheDocument();
    });

    it('clicking an issue cell opens the detail modal', async () => {
        mockFetch();
        renderGrid();
        await waitFor(() => expect(screen.getByRole('button', { name: /issue 1/i })).toBeInTheDocument());

        await userEvent.click(screen.getByRole('button', { name: /issue 1/i }));

        // Modal should appear
        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    });

    it('shows a back link', async () => {
        mockFetch();
        renderGrid();
        await waitFor(() => expect(screen.getByRole('link', { name: /back to publishers/i })).toBeInTheDocument());
    });

    it('shows an error when the fetch fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;
        renderGrid();
        await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument());
    });
});

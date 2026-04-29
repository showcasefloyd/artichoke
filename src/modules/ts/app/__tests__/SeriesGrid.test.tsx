import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

function renderAtSeriesRoute(id: string) {
    global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === `/series/${id}`) {
            return Promise.resolve({ ok: true, json: async () => mockSeries });
        }
        if (url === `/series/${id}/issues`) {
            return Promise.resolve({ ok: true, json: async () => mockIssues });
        }
        return Promise.reject(new Error('Unexpected URL: ' + url));
    }) as jest.Mock;

    render(
        <MemoryRouter initialEntries={[`/series/${id}`]}>
            <Routes>
                <Route path="/series/:id" element={<SeriesGrid />} />
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
        render(
            <MemoryRouter initialEntries={['/series/1']}>
                <Routes>
                    <Route path="/series/:id" element={<SeriesGrid />} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders the series title and issue cells', async () => {
        renderAtSeriesRoute('1');
        await waitFor(() => {
            expect(screen.getByText(/Daredevil Vol\. 1 \(1964\)/)).toBeInTheDocument();
        });
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows owned count summary', async () => {
        renderAtSeriesRoute('1');
        await waitFor(() => {
            expect(screen.getByText(/2 \/ 3 issues owned/i)).toBeInTheDocument();
        });
    });

    it('shows a back link', async () => {
        renderAtSeriesRoute('1');
        await waitFor(() => {
            expect(screen.getByRole('link', { name: /back to publishers/i })).toBeInTheDocument();
        });
    });

    it('shows an error when the fetch fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;
        render(
            <MemoryRouter initialEntries={['/series/1']}>
                <Routes>
                    <Route path="/series/:id" element={<SeriesGrid />} />
                </Routes>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });
    });
});

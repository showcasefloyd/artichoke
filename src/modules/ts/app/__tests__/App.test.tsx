import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../App';

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url === '/publishers') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    publishers: [
                        { id: 1, name: 'DC', title_count: 2 },
                        { id: 2, name: 'Empty Pub', title_count: 0 },
                    ],
                }),
            } as Response);
        }

        if (url.startsWith('/series?publisherId=1')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    series: [
                        { id: 10, titleId: 100, name: 'Batman', volume: 0, startYear: 0, publisher: 'DC', titleName: 'Batman', issueCount: 2 },
                        { id: 11, titleId: 101, name: 'No Issues Series', volume: 0, startYear: 0, publisher: 'DC', titleName: 'No Issues', issueCount: 0 },
                    ],
                }),
            } as Response);
        }

        if (url === '/series/10/grid') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    seriesId: 10,
                    firstIssue: 1,
                    finalIssue: 3,
                    gridable: true,
                    issues: [
                        { issue: '1', own: 'Y', issue_id: 1000 },
                        { issue: '2', own: 'N', issue_id: 0 },
                        { issue: '3', own: 'N', issue_id: 0 },
                    ],
                }),
            } as Response);
        }

        if (url.startsWith('/issues?')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ issues: [] }),
            } as Response);
        }

        if (url.startsWith('/issue/')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response);
        }

        return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({}),
        } as Response);
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('App', () => {
    it('shows only publishers with titles and only series with issues', async () => {
        render(<App />);

        await waitFor(() => expect(screen.getByRole('button', { name: 'DC (2)' })).toBeInTheDocument());
        expect(screen.queryByRole('button', { name: 'Empty Pub (0)' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'DC (2)' }));

        await waitFor(() => expect(fetch).toHaveBeenCalledWith('/series?publisherId=1&minimumIssueCount=1'));
        expect(await screen.findByRole('button', { name: 'Batman' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'No Issues Series' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Batman' }));

        await waitFor(() => expect(fetch).toHaveBeenCalledWith('/series/10/grid'));
        expect(await screen.findByRole('button', { name: 'See Grid' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'See Grid' }));
        expect(await screen.findByText('ComicBook Series Grid')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: '2' })).not.toBeInTheDocument();
    });
});

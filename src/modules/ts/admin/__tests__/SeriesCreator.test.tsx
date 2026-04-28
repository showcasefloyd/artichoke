import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SeriesCreator from '../SeriesCreator';

const mockOnCreated = jest.fn();
const mockOnCancel  = jest.fn();

const defaultProps = {
    publisherId: 1,
    onCreated: mockOnCreated,
    onCancel: mockOnCancel,
};

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('SeriesCreator', () => {
    it('renders the search form', () => {
        render(<SeriesCreator {...defaultProps} />);
        expect(screen.getByPlaceholderText(/Search ComicVine/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('calls onCancel when Cancel is clicked', async () => {
        render(<SeriesCreator {...defaultProps} />);
        await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('shows search results and calls POST /series on Add', async () => {
        global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
            if (String(url).startsWith('/comicvine/search')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        results: [
                            { id: 42, name: 'Daredevil', publisher: 'Marvel', countOfIssues: 380, startYear: 1964 },
                        ],
                    }),
                } as Response);
            }
            if (String(url) === '/series' && opts?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: 7, name: 'Daredevil', seededIssues: 380 }),
                } as Response);
            }
            return Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as Response);
        }) as jest.Mock;

        render(<SeriesCreator {...defaultProps} />);

        await userEvent.type(screen.getByPlaceholderText(/Search ComicVine/i), 'Daredevil');
        await userEvent.click(screen.getByRole('button', { name: /Search/i }));

        await waitFor(() => expect(screen.getByText('Daredevil')).toBeInTheDocument());
        expect(screen.getByText(/380 issues/i)).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /Add/i }));

        await waitFor(() => expect(mockOnCreated).toHaveBeenCalledWith(7));
    });

    it('shows an error when the API key is not configured', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ error: 'COMICVINE_API_KEY is not configured' }),
        } as Response) as jest.Mock;

        render(<SeriesCreator {...defaultProps} />);
        await userEvent.type(screen.getByPlaceholderText(/Search ComicVine/i), 'Batman');
        await userEvent.click(screen.getByRole('button', { name: /Search/i }));

        await waitFor(() => expect(screen.getByText(/COMICVINE_API_KEY/i)).toBeInTheDocument());
    });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminApp from '../AdminApp';

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith('/publishers')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ publishers: [] }),
            } as Response);
        }
        if (url.startsWith('/series-types')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ series_types: [] }),
            } as Response);
        }
        if (url.startsWith('/list')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ titles: [] }),
            } as Response);
        }
        if (url.startsWith('/series')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ series: [] }),
            } as Response);
        }
        if (url.startsWith('/issues')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ issues: [] }),
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

describe('AdminApp', () => {
    it('renders admin tabs and issue controls', async () => {
        render(<AdminApp />);
        await waitFor(() => expect(fetch).toHaveBeenCalled());

        expect(screen.getByRole('button', { name: 'Publishers' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Titles' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Series' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Issues' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Load Issue' })).toBeInTheDocument();
    });
});

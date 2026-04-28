import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                publishers: [
                    { id: 1, name: 'Marvel' },
                    { id: 2, name: 'DC' },
                    { id: 3, name: 'Image' },
                ],
            }),
        }) as jest.Mock;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the page header', async () => {
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText(/Artichoke, Comic Book Database/)).toBeInTheDocument();
        });
    });

    it('fetches and displays publishers', async () => {
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText('Marvel')).toBeInTheDocument();
            expect(screen.getByText('DC')).toBeInTheDocument();
            expect(screen.getByText('Image')).toBeInTheDocument();
        });
    });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TitleEditor from '../TitleEditor';

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 5, name: 'Test Title' }),
    } as Response);
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('TitleEditor', () => {
    it('loads and displays the title name', async () => {
        render(<TitleEditor titleId={5} onSaved={jest.fn()} onDeleted={jest.fn()} />);
        await waitFor(() => expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument());
    });

    it('calls PUT and fires onSaved when the form is submitted', async () => {
        const onSaved = jest.fn();
        render(<TitleEditor titleId={5} onSaved={onSaved} onDeleted={jest.fn()} />);
        await waitFor(() => screen.getByDisplayValue('Test Title'));

        await userEvent.clear(screen.getByRole('textbox'));
        await userEvent.type(screen.getByRole('textbox'), 'Updated Title');
        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
        expect(fetch).toHaveBeenCalledWith(
            '/title/5',
            expect.objectContaining({ method: 'PUT' })
        );
    });

    it('shows an error when the name field is empty and save is clicked', async () => {
        render(<TitleEditor titleId={5} onSaved={jest.fn()} onDeleted={jest.fn()} />);
        await waitFor(() => screen.getByDisplayValue('Test Title'));

        await userEvent.clear(screen.getByRole('textbox'));
        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalledWith('/title/5', expect.objectContaining({ method: 'PUT' }));
    });

    it('shows success banner after a successful save', async () => {
        render(<TitleEditor titleId={5} onSaved={jest.fn()} onDeleted={jest.fn()} />);
        await waitFor(() => screen.getByDisplayValue('Test Title'));

        await userEvent.click(screen.getByRole('button', { name: /save/i }));
        await waitFor(() => expect(screen.getByText('Saved successfully.')).toBeInTheDocument());
    });
});

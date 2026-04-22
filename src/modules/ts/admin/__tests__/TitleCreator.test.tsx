import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TitleCreator from '../TitleCreator';

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 99, name: 'New Comic' }),
    } as Response);
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('TitleCreator', () => {
    it('renders the name input and Save/Cancel buttons', () => {
        render(<TitleCreator onCreated={jest.fn()} onCancel={jest.fn()} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('shows an error when Save is clicked with an empty name', async () => {
        render(<TitleCreator onCreated={jest.fn()} onCancel={jest.fn()} />);
        await userEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('calls POST /title and fires onCreated with the new id and name', async () => {
        const onCreated = jest.fn();
        render(<TitleCreator onCreated={onCreated} onCancel={jest.fn()} />);

        await userEvent.type(screen.getByRole('textbox'), 'New Comic');
        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => expect(onCreated).toHaveBeenCalledWith(99, 'New Comic'));
        expect(fetch).toHaveBeenCalledWith(
            '/title',
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('fires onCancel when the Cancel button is clicked', async () => {
        const onCancel = jest.fn();
        render(<TitleCreator onCreated={jest.fn()} onCancel={onCancel} />);
        await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});

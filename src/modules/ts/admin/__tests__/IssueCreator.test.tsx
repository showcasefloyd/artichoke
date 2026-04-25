import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import IssueCreator from '../IssueCreator';

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 77, number: '1' }),
    } as Response);
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('IssueCreator', () => {
    it('defaults purchase date and cover month and sends timestamp values', async () => {
        const onCreated = jest.fn();
        render(<IssueCreator seriesId={10} onCreated={onCreated} onCancel={jest.fn()} />);

        expect(screen.getByLabelText('Purchase Date (Day / Month / Year)')).toBeInTheDocument();
        expect(screen.getByLabelText('Cover Date (Month / Year)')).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(/Issue Number/i), '1');
        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => expect(onCreated).toHaveBeenCalledWith(77));
        expect(fetch).toHaveBeenCalledWith('/issue', expect.objectContaining({ method: 'POST' }));

        const requestInit = (fetch as jest.Mock).mock.calls[0][1] as RequestInit;
        const body = JSON.parse(String(requestInit.body));
        expect(body.seriesId).toBe(10);
        expect(body.number).toBe('1');
        expect(body.purchaseDate).toEqual(expect.any(Number));
        expect(body.coverDate).toEqual(expect.any(Number));
    });
});

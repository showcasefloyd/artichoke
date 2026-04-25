import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import IssueEditor from '../IssueEditor';

const purchaseDateTimestamp = 1777118400; // 2026-04-25 12:00:00 UTC
const coverDateTimestamp = 1775044800; // 2026-04-01 12:00:00 UTC

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === '/issue/5/raw') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    id: 5,
                    seriesId: 10,
                    number: '7',
                    sort: '',
                    printRun: '',
                    quantity: '',
                    coverDate: coverDateTimestamp,
                    location: '',
                    type: '',
                    status: '0',
                    condition: '',
                    coverPrice: '',
                    purchasePrice: '',
                    purchaseDate: purchaseDateTimestamp,
                    guideValue: '',
                    guide: '',
                    issueValue: '',
                    comments: '',
                }),
            } as Response);
        }

        if (url === '/issue/5' && init?.method === 'PUT') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ id: 5, number: '7' }),
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

describe('IssueEditor', () => {
    it('renders date controls and saves converted timestamp values', async () => {
        const onSaved = jest.fn();
        render(<IssueEditor issueId={5} onSaved={onSaved} onDeleted={jest.fn()} />);

        const coverDateInput = await screen.findByLabelText('Cover Date (Month / Year)') as HTMLInputElement;
        const purchaseDateInput = screen.getByLabelText('Purchase Date (Day / Month / Year)') as HTMLInputElement;
        expect(coverDateInput.value).toBe('2026-04');
        expect(purchaseDateInput.value).toBe('2026-04-25');

        await userEvent.clear(coverDateInput);
        await userEvent.type(coverDateInput, '2026-05');
        await userEvent.clear(purchaseDateInput);
        await userEvent.type(purchaseDateInput, '2026-05-13');
        await userEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
        const putCall = (fetch as jest.Mock).mock.calls.find(
            (call: [unknown, RequestInit?]) => String(call[0]) === '/issue/5' && call[1]?.method === 'PUT'
        );
        expect(putCall).toBeDefined();
        const requestInit = putCall?.[1] as RequestInit;
        const body = JSON.parse(String(requestInit.body));
        expect(Number(body.coverDate)).toBeGreaterThan(0);
        expect(Number(body.purchaseDate)).toBeGreaterThan(0);
    });
});

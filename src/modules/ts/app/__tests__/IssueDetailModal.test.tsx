import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import IssueDetailModal from '../IssueDetailModal';

const mockDetail = {
    number: '5',
    storytitle: 'The Beginning',
    coverdate: 'Apr 1964',
    condition: 'VF',
    purchaseprice: '3.50',
    purchasedate: 'Jan 01, 2020',
    priceguidevalue: '12.00',
    comments: 'Great issue',
    status: 'Collected',
};

function mockFetch(detail = mockDetail) {
    global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
        if (url === '/issue/5') {
            return Promise.resolve({ ok: true, json: async () => detail });
        }
        if (url === '/issues/5/owned' && opts?.method === 'PUT') {
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        return Promise.reject(new Error('Unexpected URL: ' + url));
    }) as jest.Mock;
}

function renderModal(props: Partial<React.ComponentProps<typeof IssueDetailModal>> = {}) {
    const defaults = {
        issueId: 5,
        seriesName: 'Daredevil',
        initialOwned: false,
        onClose: jest.fn(),
        onOwnedChange: jest.fn(),
    };
    render(<IssueDetailModal {...defaults} {...props} />);
    return defaults;
}

describe('IssueDetailModal', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders without error (smoke test)', () => {
        global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;
        expect(() => renderModal()).not.toThrow();
    });

    it('shows a loading state on mount before fetch resolves', () => {
        global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;
        renderModal();
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders issue number and series name after fetch resolves', async () => {
        mockFetch();
        renderModal();
        await waitFor(() => expect(screen.getByText(/Daredevil #5/)).toBeInTheDocument());
        expect(screen.getByText(/Series:/)).toBeInTheDocument();
        expect(screen.getByText((_, el) => el?.tagName === 'P' && (el.textContent ?? '').includes('#5'))).toBeInTheDocument();
    });

    it('renders owned toggle button reflecting initial owned state', async () => {
        mockFetch();
        renderModal({ initialOwned: true });
        await waitFor(() => expect(screen.getByText(/Owned ✓/)).toBeInTheDocument());
    });

    it('owned toggle calls PUT /issues/:id/owned and fires onOwnedChange', async () => {
        mockFetch();
        const onOwnedChange = jest.fn();
        renderModal({ onOwnedChange });
        await waitFor(() => expect(screen.getByRole('button', { name: /mark as owned/i })).toBeInTheDocument());

        await userEvent.click(screen.getByRole('button', { name: /mark as owned/i }));

        await waitFor(() => expect(onOwnedChange).toHaveBeenCalledWith(5, true));
        expect(global.fetch).toHaveBeenCalledWith('/issues/5/owned', { method: 'PUT' });
    });

    it('close button calls onClose', async () => {
        mockFetch();
        const onClose = jest.fn();
        renderModal({ onClose });
        await waitFor(() => expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument());

        await userEvent.click(screen.getByRole('button', { name: /close/i }));

        expect(onClose).toHaveBeenCalled();
    });

    it('clicking the backdrop calls onClose', async () => {
        mockFetch();
        const onClose = jest.fn();
        renderModal({ onClose });

        const backdrop = document.querySelector('.issue-modal-backdrop') as HTMLElement;
        await userEvent.click(backdrop);

        expect(onClose).toHaveBeenCalled();
    });

    it('shows an error when the fetch fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;
        renderModal();
        await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument());
    });
});

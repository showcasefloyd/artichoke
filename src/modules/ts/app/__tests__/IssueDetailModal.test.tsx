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

function mockFetch(detail = mockDetail, enrichedDetail?: typeof mockDetail) {
    global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
        if (url === '/issue/5' && !opts) {
            return Promise.resolve({ ok: true, json: async () => detail });
        }
        if (url === '/issue/5/enrich' && opts?.method === 'POST') {
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        if (url === '/issues/5/owned' && opts?.method === 'PUT') {
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        return Promise.reject(new Error('Unexpected URL: ' + url));
    }) as jest.Mock;
    // If enrichedDetail provided, second call to GET /issue/5 returns enriched data
    if (enrichedDetail) {
        let getCallCount = 0;
        global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
            if (url === '/issue/5' && !opts) {
                getCallCount++;
                return Promise.resolve({ ok: true, json: async () => getCallCount === 1 ? detail : enrichedDetail });
            }
            if (url === '/issue/5/enrich' && opts?.method === 'POST') {
                return Promise.resolve({ ok: true, json: async () => ({}) });
            }
            if (url === '/issues/5/owned' && opts?.method === 'PUT') {
                return Promise.resolve({ ok: true, json: async () => ({}) });
            }
            return Promise.reject(new Error('Unexpected URL: ' + url));
        }) as jest.Mock;
    }
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

    it('renders all metadata fields after fetch resolves', async () => {
        mockFetch();
        renderModal();
        await waitFor(() => expect(screen.getByText(/Daredevil #5/)).toBeInTheDocument());
        expect(screen.getByText(/Series:/)).toBeInTheDocument();
        expect(screen.getByText(/Story Title:/)).toBeInTheDocument();
        expect(screen.getByText(/Cover Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Condition:/)).toBeInTheDocument();
        expect(screen.getByText(/Purchase Price:/)).toBeInTheDocument();
        expect(screen.getByText(/Purchase Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Guide Value:/)).toBeInTheDocument();
        expect(screen.getByText(/Comments:/)).toBeInTheDocument();
        // Check values
        expect(screen.getByText('The Beginning')).toBeInTheDocument();
        expect(screen.getByText('Apr 1964')).toBeInTheDocument();
        expect(screen.getByText('VF')).toBeInTheDocument();
        expect(screen.getByText('3.50')).toBeInTheDocument();
        expect(screen.getByText('Jan 01, 2020')).toBeInTheDocument();
        expect(screen.getByText('12.00')).toBeInTheDocument();
        expect(screen.getByText('Great issue')).toBeInTheDocument();
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

    describe('auto-enrichment', () => {
        const unenrichedDetail = { ...mockDetail, storytitle: '', coverdate: '' };
        const enrichedDetail   = { ...mockDetail, storytitle: 'Enriched Story', coverdate: 'May 1964' };

        it('calls POST /issue/:id/enrich then re-fetches when owned and storytitle is missing', async () => {
            mockFetch(unenrichedDetail, enrichedDetail);
            renderModal({ initialOwned: true });

            await waitFor(() => expect(screen.getByText('Enriched Story')).toBeInTheDocument());

            expect(global.fetch).toHaveBeenCalledWith('/issue/5/enrich', { method: 'POST' });
            // GET /issue/5 called twice: initial fetch + re-fetch after enrich
            const getCalls = (global.fetch as jest.Mock).mock.calls.filter(
                ([url, opts]: [string, RequestInit | undefined]) => url === '/issue/5' && !opts
            );
            expect(getCalls).toHaveLength(2);
        });

        it('skips enrichment when storytitle is already present', async () => {
            mockFetch(mockDetail); // mockDetail has storytitle
            renderModal({ initialOwned: true });

            await waitFor(() => expect(screen.getByText('The Beginning')).toBeInTheDocument());

            const enrichCalls = (global.fetch as jest.Mock).mock.calls.filter(
                ([url, opts]: [string, RequestInit | undefined]) => url === '/issue/5/enrich' && opts?.method === 'POST'
            );
            expect(enrichCalls).toHaveLength(0);
        });

        it('skips enrichment when issue is not owned (status !== Collected)', async () => {
            const notOwnedDetail = { ...unenrichedDetail, status: 'Wish List' };
            mockFetch(notOwnedDetail);
            renderModal({ initialOwned: false });

            await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

            const enrichCalls = (global.fetch as jest.Mock).mock.calls.filter(
                ([url, opts]: [string, RequestInit | undefined]) => url === '/issue/5/enrich' && opts?.method === 'POST'
            );
            expect(enrichCalls).toHaveLength(0);
        });

        it('shows error when enrichment request fails', async () => {
            global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
                if (url === '/issue/5' && !opts) {
                    return Promise.resolve({ ok: true, json: async () => unenrichedDetail });
                }
                if (url === '/issue/5/enrich' && opts?.method === 'POST') {
                    return Promise.resolve({ ok: false, status: 500 });
                }
                return Promise.reject(new Error('Unexpected URL: ' + url));
            }) as jest.Mock;

            renderModal({ initialOwned: true });
            await waitFor(() => expect(screen.getByText(/enrichment failed/i)).toBeInTheDocument());
        });
    });
});

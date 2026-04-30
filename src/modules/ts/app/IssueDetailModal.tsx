import React, { useEffect, useState, useCallback } from 'react';
import './IssueDetailModal.scss';

interface IssueDetail {
    number: string;
    storytitle: string;
    coverdate: string;
    condition: string;
    purchaseprice: number | string;
    purchasedate: string;
    priceguidevalue: number | string;
    comments: string;
    status: string;
    comicvinissueid?: string;
    coverimageurl?: string;
}

interface IssueDetailModalProps {
    issueId: number;
    seriesName: string;
    initialOwned: boolean;
    onClose: () => void;
    onOwnedChange: (issueId: number, owned: boolean) => void;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
    issueId,
    seriesName,
    initialOwned,
    onClose,
    onOwnedChange,
}) => {
    const [detail, setDetail]     = useState<IssueDetail | null>(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [owned, setOwned]       = useState(initialOwned);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        const fetchIssue = (): Promise<IssueDetail> =>
            fetch(`/issue/${issueId}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to load issue (${res.status})`);
                    return res.json() as Promise<IssueDetail>;
                });

        fetchIssue()
            .then((data: IssueDetail) => {
                const needsEnrich = data.status === 'Collected' && !data.storytitle;
                if (!needsEnrich) {
                    if (!cancelled) { setDetail(data); setLoading(false); }
                    return;
                }
                // Auto-enrich then re-fetch so we get the same formatted response shape
                return fetch(`/issue/${issueId}/enrich`, { method: 'POST' })
                    .then(res => {
                        if (!res.ok) throw new Error(`Enrichment failed (${res.status})`);
                        return fetchIssue();
                    })
                    .then((enriched: IssueDetail) => {
                        if (!cancelled) { setDetail(enriched); setLoading(false); }
                    });
            })
            .catch(e => {
                if (!cancelled) { setError(String(e.message ?? e)); setLoading(false); }
            });

        return () => { cancelled = true; };
    }, [issueId]);

    const handleToggleOwned = useCallback(() => {
        if (toggling) return;
        const nextOwned = !owned;
        setOwned(nextOwned);
        setToggling(true);
        fetch(`/issues/${issueId}/owned`, { method: 'PUT' })
            .then(res => {
                if (!res.ok) throw new Error(`Toggle failed (${res.status})`);
                return res.json();
            })
            .then(() => {
                onOwnedChange(issueId, nextOwned);
                setToggling(false);
            })
            .catch(() => {
                setOwned(!nextOwned); // revert on error
                setToggling(false);
            });
    }, [issueId, owned, toggling, onOwnedChange]);

    return (
        <div className="issue-modal-backdrop" onClick={onClose} role="presentation">
            <div
                className="issue-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Issue details"
            >
                <div className="issue-modal-header">
                    <h5 className="mb-0">
                        {seriesName}{detail ? ` #${detail.number}` : ''}
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={onClose}
                    />
                </div>
                <div className="issue-modal-body">
                    {loading && <p>Loading&hellip;</p>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    {!loading && !error && detail && (
    <>
        <p className="mb-1"><strong>Series:</strong> {seriesName}</p>
        <p className="mb-1"><strong>Issue:</strong> #{detail.number}</p>
        <p className="mb-1"><strong>Story Title:</strong> {detail.storytitle || '—'}</p>
        <p className="mb-1"><strong>Cover Date:</strong> {detail.coverdate || '—'}</p>
        <p className="mb-1"><strong>Condition:</strong> {detail.condition || '—'}</p>
        <p className="mb-1"><strong>Purchase Price:</strong> {detail.purchaseprice || '—'}</p>
        <p className="mb-1"><strong>Purchase Date:</strong> {detail.purchasedate || '—'}</p>
        <p className="mb-1"><strong>Guide Value:</strong> {detail.priceguidevalue || '—'}</p>
        <p className="mb-1"><strong>Comments:</strong> {detail.comments || '—'}</p>
        <button
            type="button"
            className={`btn btn-sm ${owned ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={handleToggleOwned}
            disabled={toggling}
            aria-label={owned ? 'Mark as not owned' : 'Mark as owned'}
        >
            {owned ? 'Owned ✓' : 'Not Owned'}
        </button>
    </>
)}
                </div>
            </div>
        </div>
    );
};

export default IssueDetailModal;

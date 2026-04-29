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
        setLoading(true);
        fetch(`/issue/${issueId}`)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load issue (${res.status})`);
                return res.json();
            })
            .then((data: IssueDetail) => {
                setDetail(data);
                setLoading(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoading(false);
            });
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
                            <p className="mb-3"><strong>Issue:</strong> #{detail.number}</p>
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

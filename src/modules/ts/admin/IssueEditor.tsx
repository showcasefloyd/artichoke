import React, { useEffect, useState } from 'react';
import {
    dateInputToTimestamp,
    monthInputToTimestamp,
    timestampToDateInput,
    timestampToMonthInput,
    toDayMonthYearLabel,
    toMonthYearLabel,
} from './issueDates';

interface IssueData {
    id: number;
    seriesId: number;
    number: string;
    sort: string;
    printRun: string;
    quantity: string;
    coverDate: string | number;
    location: string;
    type: string;
    status: string;
    condition: string;
    coverPrice: string;
    purchasePrice: string;
    purchaseDate: string | number;
    guideValue: string;
    guide: string;
    issueValue: string;
    comments: string;
}

interface Props {
    issueId: number;
    onSaved: () => void;
    onDeleted: () => void;
}

const IssueEditor: React.FC<Props> = ({ issueId, onSaved, onDeleted }) => {
    const [data, setData] = useState<IssueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/issue/${issueId}/raw`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); });
    }, [issueId]);

    const set = (field: keyof IssueData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setData(prev => prev ? { ...prev, [field]: e.target.value } : prev);

    const setPurchaseDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timestamp = dateInputToTimestamp(e.target.value);
        setData(prev => prev ? { ...prev, purchaseDate: timestamp ? String(timestamp) : '' } : prev);
    };

    const setCoverDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timestamp = monthInputToTimestamp(e.target.value);
        setData(prev => prev ? { ...prev, coverDate: timestamp ? String(timestamp) : '' } : prev);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data?.number.trim()) { setError('Issue number is required'); return; }
        fetch(`/issue/${issueId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(res => { if (!res.ok) throw new Error(`Server error ${res.status}`); return res.json(); })
            .then(() => { setError(''); setSuccess('Saved successfully.'); onSaved(); })
            .catch(err => setError(err.message));
    };

    const handleDelete = () => {
        if (!confirm(`Delete issue #${data?.number}? This cannot be undone.`)) return;
        fetch(`/issue/${issueId}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) throw new Error(`Server error ${res.status}`); return res.json(); })
            .then(() => onDeleted())
            .catch(err => setError(err.message));
    };

    if (loading || !data) return <p>Loading&hellip;</p>;

    const field = (label: string, key: keyof IssueData) => (
        <div className="mb-3" key={key}>
            <label className="form-label" htmlFor={`input-${key}`}>{label}</label>
            <input
                type="text"
                className="form-control"
                id={`input-${key}`}
                value={data[key] ?? ''}
                onChange={set(key)}
            />
        </div>
    );

    return (
        <div>
            <p className="lead text-primary">Edit Issue</p>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSave}>
                {field('Issue Number *', 'number')}
                {field('Sort Order', 'sort')}
                {field('Print Run', 'printRun')}
                {field('Quantity', 'quantity')}
                <div className="mb-3">
                    <label className="form-label" htmlFor="input-cover-date">Cover Date (Month / Year)</label>
                    <input
                        type="month"
                        className="form-control"
                        id="input-cover-date"
                        value={timestampToMonthInput(data.coverDate)}
                        onChange={setCoverDate}
                    />
                    <small className="text-muted">Display format: {toMonthYearLabel(data.coverDate)}</small>
                </div>
                {field('Location', 'location')}
                {field('Type', 'type')}
                <div className="mb-3">
                    <label className="form-label" htmlFor="input-status">Status</label>
                    <select className="form-select" id="input-status" value={data.status} onChange={set('status')}>
                        <option value="0">Collected</option>
                        <option value="1">For Sale</option>
                        <option value="2">Wish List</option>
                    </select>
                </div>
                {field('Condition', 'condition')}
                {field('Cover Price', 'coverPrice')}
                {field('Purchase Price', 'purchasePrice')}
                <div className="mb-3">
                    <label className="form-label" htmlFor="input-purchase-date">Purchase Date (Day / Month / Year)</label>
                    <input
                        type="date"
                        className="form-control"
                        id="input-purchase-date"
                        value={timestampToDateInput(data.purchaseDate)}
                        onChange={setPurchaseDate}
                    />
                    <small className="text-muted">Display format: {toDayMonthYearLabel(data.purchaseDate)}</small>
                </div>
                {field('Guide Value', 'guideValue')}
                {field('Price Guide', 'guide')}
                {field('Issue Value', 'issueValue')}
                {field('Comments', 'comments')}
                <div className="mb-3">
                    <button type="submit" className="btn btn-primary me-2">Save</button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
            </form>
        </div>
    );
};

export default IssueEditor;

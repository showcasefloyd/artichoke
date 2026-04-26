import React, { useEffect, useState } from 'react';
import {
    currentMonthInput,
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
    storyTitle: string;
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

    const setCoverMonth = (month: string) => {
        setData(prev => {
            if (!prev) {
                return prev;
            }
            const current = timestampToMonthInput(prev.coverDate) || currentMonthInput();
            const year = current.split('-')[0] ?? '';
            const timestamp = monthInputToTimestamp(`${year}-${month}`);
            return { ...prev, coverDate: timestamp ? String(timestamp) : '' };
        });
    };

    const setCoverYear = (year: string) => {
        setData(prev => {
            if (!prev) {
                return prev;
            }
            const current = timestampToMonthInput(prev.coverDate) || currentMonthInput();
            const month = current.split('-')[1] ?? '';
            const timestamp = monthInputToTimestamp(`${year}-${month}`);
            return { ...prev, coverDate: timestamp ? String(timestamp) : '' };
        });
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

    const currentYear = new Date().getUTCFullYear();
    const yearOptions: string[] = [];
    for (let year = currentYear + 1; year >= 1900; year--) {
        yearOptions.push(String(year));
    }
    const monthOptions = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];
    const currentCoverMonth = timestampToMonthInput(data.coverDate) || currentMonthInput();
    const currentCoverYear = currentCoverMonth.split('-')[0] ?? '';
    const currentCoverMonthNumber = currentCoverMonth.split('-')[1] ?? '';

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
                {field('Story Title', 'storyTitle')}
                {field('Sort Order', 'sort')}
                {field('Print Run', 'printRun')}
                {field('Quantity', 'quantity')}
                <div className="mb-3">
                    <label className="form-label" htmlFor="input-cover-month-select">Cover Date (Month / Year)</label>
                    <div className="row g-2">
                        <div className="col-7">
                            <select
                                className="form-select"
                                id="input-cover-month-select"
                                value={currentCoverMonthNumber}
                                onChange={e => setCoverMonth(e.target.value)}
                            >
                                {monthOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-5">
                            <select
                                className="form-select"
                                aria-label="Cover Year"
                                value={currentCoverYear}
                                onChange={e => setCoverYear(e.target.value)}
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
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

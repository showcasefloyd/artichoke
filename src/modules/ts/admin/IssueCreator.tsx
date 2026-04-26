import React, { useState } from 'react';
import {
    currentMonthInput,
    dateInputToTimestamp,
    monthInputToTimestamp,
    toDayMonthYearLabel,
    toMonthYearLabel,
    todayDateInput,
} from './issueDates';

interface Props {
    seriesId: number;
    onCreated: (id: number) => void;
    onCancel: () => void;
    initialNumber?: string;
    initialSort?: string;
}

const IssueCreator: React.FC<Props> = ({ seriesId, onCreated, onCancel, initialNumber = '', initialSort = '' }) => {
    const [number, setNumber] = useState(initialNumber);
    const [storyTitle, setStoryTitle] = useState('');
    const [sort, setSort] = useState(initialSort);
    const [purchaseDate, setPurchaseDate] = useState(todayDateInput());
    const initialCoverMonth = currentMonthInput();
    const [coverYear, setCoverYear] = useState(initialCoverMonth.split('-')[0] ?? '');
    const [coverMonth, setCoverMonth] = useState(initialCoverMonth.split('-')[1] ?? '');
    const [error, setError] = useState('');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!number.trim()) { setError('Issue number is required'); return; }
        const purchaseTimestamp = dateInputToTimestamp(purchaseDate);
        if (!purchaseTimestamp) { setError('Purchase date is invalid'); return; }
        const coverTimestamp = monthInputToTimestamp(`${coverYear}-${coverMonth}`);
        if (!coverTimestamp) { setError('Cover date is invalid'); return; }

        fetch('/issue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seriesId,
                    number,
                    storyTitle,
                    sort,
                    purchaseDate: purchaseTimestamp,
                    coverDate: coverTimestamp,
                }),
        })
            .then(res => res.json())
            .then(data => { setError(''); onCreated(data.id); });
    };

    return (
        <div>
            <p className="lead text-primary">Create New Issue</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputIssueNumber">
                        Issue Number <span className="mandatory-field-marker">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="inputIssueNumber"
                        value={number}
                        placeholder="e.g. 1"
                        onChange={e => setNumber(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputIssueSort">
                        Sort Order (Grid Position)
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="inputIssueSort"
                        value={sort}
                        min={1}
                        placeholder="e.g. 27"
                        onChange={e => setSort(e.target.value)}
                    />
                    <small className="text-muted">Use this to place non-standard issue numbers in the correct grid slot.</small>
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputStoryTitle">
                        Story Title
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="inputStoryTitle"
                        value={storyTitle}
                        placeholder="e.g. The Girl Who Hated Supergirl!"
                        onChange={e => setStoryTitle(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputPurchaseDate">
                        Purchase Date (Day / Month / Year)
                    </label>
                    <input
                        type="date"
                        className="form-control"
                        id="inputPurchaseDate"
                        value={purchaseDate}
                        onChange={e => setPurchaseDate(e.target.value)}
                    />
                    <small className="text-muted">Display format: {toDayMonthYearLabel(dateInputToTimestamp(purchaseDate))}</small>
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputCoverMonthSelect">
                        Cover Date (Month / Year)
                    </label>
                    <div className="row g-2">
                        <div className="col-7">
                            <select
                                className="form-select"
                                id="inputCoverMonthSelect"
                                value={coverMonth}
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
                                value={coverYear}
                                onChange={e => setCoverYear(e.target.value)}
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <small className="text-muted">Display format: {toMonthYearLabel(monthInputToTimestamp(`${coverYear}-${coverMonth}`))}</small>
                </div>
                <div className="mb-3">
                    <button type="submit" className="btn btn-primary me-2">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default IssueCreator;

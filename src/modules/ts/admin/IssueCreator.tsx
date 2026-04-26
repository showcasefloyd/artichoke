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
}

const IssueCreator: React.FC<Props> = ({ seriesId, onCreated, onCancel }) => {
    const [number, setNumber] = useState('');
    const [storyTitle, setStoryTitle] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(todayDateInput());
    const [coverMonth, setCoverMonth] = useState(currentMonthInput());
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!number.trim()) { setError('Issue number is required'); return; }
        const purchaseTimestamp = dateInputToTimestamp(purchaseDate);
        if (!purchaseTimestamp) { setError('Purchase date is invalid'); return; }
        const coverTimestamp = monthInputToTimestamp(coverMonth);
        if (!coverTimestamp) { setError('Cover date is invalid'); return; }

        fetch('/issue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seriesId,
                    number,
                    storyTitle,
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
                    <label className="form-label" htmlFor="inputCoverMonth">
                        Cover Date (Month / Year)
                    </label>
                    <input
                        type="month"
                        className="form-control"
                        id="inputCoverMonth"
                        value={coverMonth}
                        onChange={e => setCoverMonth(e.target.value)}
                    />
                    <small className="text-muted">Display format: {toMonthYearLabel(monthInputToTimestamp(coverMonth))}</small>
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

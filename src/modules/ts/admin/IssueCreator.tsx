import React, { useState } from 'react';

interface Props {
    seriesId: number;
    onCreated: (id: number) => void;
    onCancel: () => void;
}

const IssueCreator: React.FC<Props> = ({ seriesId, onCreated, onCancel }) => {
    const [number, setNumber] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!number.trim()) { setError('Issue number is required'); return; }
        fetch('/issue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seriesId, number }),
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
                    <button type="submit" className="btn btn-primary me-2">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default IssueCreator;

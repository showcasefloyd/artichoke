import React, { useState } from 'react';

interface Props {
    titleId: number;
    onCreated: (id: number, name: string) => void;
    onCancel: () => void;
}

const SeriesCreator: React.FC<Props> = ({ titleId, onCreated, onCancel }) => {
    const [name, setName] = useState('');
    const [publisher, setPublisher] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
        if (!publisher.trim()) { setError('Publisher is required'); return; }
        fetch('/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titleId, name, publisher }),
        })
            .then(res => res.json())
            .then(data => { setError(''); onCreated(data.id, data.name); });
    };

    return (
        <div>
            <p className="lead text-primary">Create New Series</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputSeriesName">
                        Name <span className="mandatory-field-marker">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="inputSeriesName"
                        value={name}
                        placeholder="Series name"
                        onChange={e => setName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputPublisher">
                        Publisher <span className="mandatory-field-marker">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="inputPublisher"
                        value={publisher}
                        placeholder="Publisher name"
                        onChange={e => setPublisher(e.target.value)}
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

export default SeriesCreator;

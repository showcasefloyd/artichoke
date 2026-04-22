import React, { useState } from 'react';

interface Props {
    onCreated: (id: number, name: string) => void;
    onCancel: () => void;
}

const TitleCreator: React.FC<Props> = ({ onCreated, onCancel }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
        fetch('/title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        })
            .then(res => res.json())
            .then(data => { setError(''); onCreated(data.id, data.name); });
    };

    return (
        <div>
            <p className="lead text-primary">Create New Title</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputTitle">
                        Name <span className="mandatory-field-marker">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="inputTitle"
                        value={name}
                        placeholder="New title name"
                        onChange={e => setName(e.target.value)}
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

export default TitleCreator;

import React, { useEffect, useState } from 'react';

interface Props {
    titleId: number;
    onSaved: () => void;
    onDeleted: () => void;
}

const TitleEditor: React.FC<Props> = ({ titleId, onSaved, onDeleted }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/title/${titleId}`)
            .then(res => res.json())
            .then(data => { setName(data.name ?? ''); setLoading(false); });
    }, [titleId]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
        fetch(`/title/${titleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        })
            .then(res => res.json())
            .then(() => { setError(''); onSaved(); });
    };

    const handleDelete = () => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        fetch(`/title/${titleId}`, { method: 'DELETE' })
            .then(() => onDeleted());
    };

    if (loading) return <p>Loading&hellip;</p>;

    return (
        <div>
            <p className="lead text-primary">Edit Title</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSave}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputTitle">
                        Name <span className="mandatory-field-marker">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="inputTitle"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <button type="submit" className="btn btn-primary me-2">Save</button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
            </form>
        </div>
    );
};

export default TitleEditor;

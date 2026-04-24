import React, { useEffect, useState } from 'react';

interface Props {
    publisherId: number;
    onSaved: () => void;
    onDeleted: () => void;
}

const PublisherEditor: React.FC<Props> = ({ publisherId, onSaved, onDeleted }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/publisher/${publisherId}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load publisher (${res.status})`); return res.json(); })
            .then(data => { setName(data.name ?? ''); setLoading(false); })
            .catch(err => { setError(String(err.message ?? err)); setLoading(false); });
    }, [publisherId]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
        fetch(`/publisher/${publisherId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        })
            .then(res => { if (!res.ok) throw new Error(`Server error ${res.status}`); return res.json(); })
            .then(data => {
                if (data.error) throw new Error(String(data.error));
                setError('');
                setSuccess('Saved successfully.');
                onSaved();
            })
            .catch(err => setError(String(err.message ?? err)));
    };

    const handleDelete = () => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        fetch(`/publisher/${publisherId}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) throw new Error(`Server error ${res.status}`); return res.json(); })
            .then(data => {
                if (data.error) throw new Error(String(data.error));
                if (!data.deleted) throw new Error('Delete failed');
                onDeleted();
            })
            .catch(err => setError(String(err.message ?? err)));
    };

    if (loading) return <p>Loading&hellip;</p>;

    return (
        <div>
            <p className="lead text-primary">Edit Publisher</p>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSave}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputPublisherName">
                        Name <span className="mandatory-field-marker">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="inputPublisherName"
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

export default PublisherEditor;

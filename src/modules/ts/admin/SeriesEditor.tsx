import React, { useEffect, useState } from 'react';

interface SeriesData {
    id: number;
    titleId: number;
    name: string;
    publisher: string;
    type: string;
    defaultPrice: string;
    firstIssue: string;
    finalIssue: string;
    subscribed: string;
    comments: string;
}

interface Props {
    seriesId: number;
    onSaved: () => void;
    onDeleted: () => void;
}

const SeriesEditor: React.FC<Props> = ({ seriesId, onSaved, onDeleted }) => {
    const [data, setData] = useState<SeriesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/series/${seriesId}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); });
    }, [seriesId]);

    const set = (field: keyof SeriesData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setData(prev => prev ? { ...prev, [field]: e.target.value } : prev);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data?.name.trim()) { setError('Name is required'); return; }
        fetch(`/series/${seriesId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(res => res.json())
            .then(() => { setError(''); onSaved(); });
    };

    const handleDelete = () => {
        if (!confirm(`Delete series "${data?.name}"? This cannot be undone.`)) return;
        fetch(`/series/${seriesId}`, { method: 'DELETE' })
            .then(() => onDeleted());
    };

    if (loading || !data) return <p>Loading&hellip;</p>;

    const field = (label: string, key: keyof SeriesData) => (
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
            <p className="lead text-primary">Edit Series</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSave}>
                {field('Name *', 'name')}
                {field('Publisher', 'publisher')}
                {field('Type', 'type')}
                {field('Default Price', 'defaultPrice')}
                {field('First Issue', 'firstIssue')}
                {field('Final Issue', 'finalIssue')}
                {field('Subscribed', 'subscribed')}
                {field('Comments', 'comments')}
                <div className="mb-3">
                    <button type="submit" className="btn btn-primary me-2">Save</button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
            </form>
        </div>
    );
};

export default SeriesEditor;

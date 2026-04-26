import React, { useEffect, useState } from 'react';
import { Publisher, SeriesType } from '../app/App';

interface SeriesData {
    id: number;
    titleId: number;
    name: string;
    volume: string;
    startYear: string;
    publisher: string;
    type: string;
    defaultPrice: string;
    firstIssue: string;
    finalIssue: string;
    totalIssues: string;
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
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [seriesTypes, setSeriesTypes] = useState<SeriesType[]>([]);
    const [loadingPublishers, setLoadingPublishers] = useState(true);
    const [loadingSeriesTypes, setLoadingSeriesTypes] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/series/${seriesId}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); });
    }, [seriesId]);

    useEffect(() => {
        setLoadingPublishers(true);
        fetch('/publishers')
            .then(res => { if (!res.ok) throw new Error(`Failed to load publishers (${res.status})`); return res.json(); })
            .then(data => { setPublishers(data.publishers ?? []); setLoadingPublishers(false); })
            .catch(e => { setError(String(e.message ?? e)); setLoadingPublishers(false); });
    }, []);

    useEffect(() => {
        setLoadingSeriesTypes(true);
        fetch('/series-types')
            .then(res => { if (!res.ok) throw new Error(`Failed to load series types (${res.status})`); return res.json(); })
            .then(data => { setSeriesTypes(data.series_types ?? []); setLoadingSeriesTypes(false); })
            .catch(e => { setError(String(e.message ?? e)); setLoadingSeriesTypes(false); });
    }, []);

    const set = (field: keyof SeriesData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setData(prev => prev ? { ...prev, [field]: e.target.value } : prev);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data?.name.trim()) { setError('Name is required'); return; }
        fetch(`/series/${seriesId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(res => { if (!res.ok) throw new Error(`Server error ${res.status}`); return res.json(); })
            .then(() => { setError(''); setSuccess('Saved successfully.'); onSaved(); })
            .catch(err => setError(err.message));
    };

    const handleDelete = () => {
        if (!confirm(`Delete series "${data?.name}"? This cannot be undone.`)) return;
        fetch(`/series/${seriesId}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) throw new Error(`Server error ${res.status}`); return res.json(); })
            .then(() => onDeleted())
            .catch(err => setError(err.message));
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
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSave}>
                {field('Name *', 'name')}
                {field('Volume', 'volume')}
                {field('Start Year', 'startYear')}
                <div className="mb-3">
                    <label className="form-label" htmlFor="input-publisher">
                        Publisher <span className="mandatory-field-marker">*</span>
                    </label>
                    {loadingPublishers ? (
                        <p className="form-text">Loading publishers&hellip;</p>
                    ) : (
                        <select
                            className="form-select"
                            id="input-publisher"
                            value={data.publisher ?? ''}
                            onChange={set('publisher')}
                        >
                            {publishers.find(p => p.name === data.publisher) ? null : (
                                <option value={data.publisher}>{data.publisher}</option>
                            )}
                            {publishers.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="input-series-type">Type</label>
                    {loadingSeriesTypes ? (
                        <p className="form-text">Loading series types&hellip;</p>
                    ) : (
                        <select
                            className="form-select"
                            id="input-series-type"
                            value={data.type ?? ''}
                            onChange={set('type')}
                        >
                            <option value="">-- none --</option>
                            {seriesTypes.find(t => t.name === data.type) ? null : (
                                <option value={data.type}>{data.type}</option>
                            )}
                            {seriesTypes.map(t => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                {field('Default Price', 'defaultPrice')}
                {field('First Issue', 'firstIssue')}
                {field('Final Issue', 'finalIssue')}
                {field('Total Issues', 'totalIssues')}
                {field('Subscribed', 'subscribed')}
                {field('Comments', 'comments')}
                <div className="mb-3">
                    <button type="submit" className="btn btn-primary me-2" disabled={loadingPublishers || publishers.length === 0 || loadingSeriesTypes}>Save</button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
            </form>
        </div>
    );
};

export default SeriesEditor;

import React, { useEffect, useState } from 'react';
import { Publisher, SeriesType } from '../app/App';

interface Props {
    titleId: number;
    onCreated: (id: number, name: string) => void;
    onCancel: () => void;
}

const SeriesCreator: React.FC<Props> = ({ titleId, onCreated, onCancel }) => {
    const [name, setName] = useState('');
    const [publisher, setPublisher] = useState('');
    const [seriesType, setSeriesType] = useState('');
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [seriesTypes, setSeriesTypes] = useState<SeriesType[]>([]);
    const [loadingPublishers, setLoadingPublishers] = useState(true);
    const [loadingSeriesTypes, setLoadingSeriesTypes] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoadingPublishers(true);
        fetch('/publishers')
            .then(res => { if (!res.ok) throw new Error(`Failed to load publishers (${res.status})`); return res.json(); })
            .then(data => {
                const list = data.publishers ?? [];
                setPublishers(list);
                if (!publisher && list.length > 0) {
                    setPublisher(list[0].name);
                }
                setLoadingPublishers(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoadingPublishers(false);
            });
    }, []);

    useEffect(() => {
        setLoadingSeriesTypes(true);
        fetch('/series-types')
            .then(res => { if (!res.ok) throw new Error(`Failed to load series types (${res.status})`); return res.json(); })
            .then(data => {
                const list = data.series_types ?? [];
                setSeriesTypes(list);
                if (!seriesType && list.length > 0) {
                    setSeriesType(list[0].name);
                }
                setLoadingSeriesTypes(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoadingSeriesTypes(false);
            });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
        if (!publisher.trim()) { setError('Publisher is required'); return; }
        fetch('/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titleId, name, publisher, type: seriesType }),
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
                    {loadingPublishers ? (
                        <p className="form-text">Loading publishers&hellip;</p>
                    ) : (
                        <select
                            className="form-select"
                            id="inputPublisher"
                            value={publisher}
                            onChange={e => setPublisher(e.target.value)}
                        >
                            {publishers.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="inputSeriesType">Series Type</label>
                    {loadingSeriesTypes ? (
                        <p className="form-text">Loading series types&hellip;</p>
                    ) : (
                        <select
                            className="form-select"
                            id="inputSeriesType"
                            value={seriesType}
                            onChange={e => setSeriesType(e.target.value)}
                        >
                            <option value="">-- none --</option>
                            {seriesTypes.map(t => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="mb-3">
                    <button type="submit" className="btn btn-primary me-2" disabled={loadingPublishers || publishers.length === 0 || loadingSeriesTypes}>Save</button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default SeriesCreator;

import React, { useState } from 'react';

interface Props {
    publisherId: number;
    onCreated: (id: number) => void;
    onCancel: () => void;
}

interface ComicVineVolume {
    id: number;
    name: string;
    publisher: string | null;
    countOfIssues: number;
    startYear: number | null;
}

const SeriesCreator: React.FC<Props> = ({ publisherId, onCreated, onCancel }) => {
    const [query, setQuery]           = useState('');
    const [searching, setSearching]   = useState(false);
    const [results, setResults]       = useState<ComicVineVolume[]>([]);
    const [searchError, setSearchError] = useState('');
    const [seeding, setSeeding]       = useState(false);
    const [seedError, setSeedError]   = useState('');
    const [searched, setSearched]     = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        setSearchError('');
        setResults([]);
        setSearched(false);
        fetch(`/comicvine/search?q=${encodeURIComponent(query.trim())}`)
            .then(res => { if (!res.ok) throw new Error(`Search failed (${res.status})`); return res.json(); })
            .then(data => {
                if (data.error) throw new Error(data.error);
                setResults(data.results ?? []);
                setSearched(true);
                setSearching(false);
            })
            .catch(e => {
                setSearchError(String(e.message ?? e));
                setSearching(false);
            });
    };

    const handleSelect = (vol: ComicVineVolume) => {
        setSeeding(true);
        setSeedError('');
        fetch('/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                publisherId,
                name: vol.name,
                startYear: vol.startYear ?? undefined,
                totalIssues: vol.countOfIssues || 1,
                comicvineVolumeId: vol.id,
            }),
        })
            .then(res => { if (!res.ok) throw new Error(`Failed to create series (${res.status})`); return res.json(); })
            .then(data => {
                setSeeding(false);
                onCreated(data.id);
            })
            .catch(e => {
                setSeedError(String(e.message ?? e));
                setSeeding(false);
            });
    };

    return (
        <div>
            <p className="lead text-primary">Add Series via ComicVine</p>

            <form onSubmit={handleSearch} className="mb-3">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search ComicVine e.g. Daredevil"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                        disabled={searching || seeding}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={searching || seeding || !query.trim()}
                    >
                        {searching ? 'Searching\u2026' : 'Search'}
                    </button>
                </div>
            </form>

            {searchError && <div className="alert alert-danger">{searchError}</div>}
            {seedError   && <div className="alert alert-danger">{seedError}</div>}

            {searched && results.length === 0 && (
                <p className="text-muted">No results found.</p>
            )}

            {results.length > 0 && (
                <ul className="list-group mb-3">
                    {results.map(vol => (
                        <li key={vol.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                            <span>
                                <strong>{vol.name}</strong>
                                {vol.startYear ? ` (${vol.startYear})` : ''}
                                {vol.publisher ? <span className="text-muted ms-2">— {vol.publisher}</span> : ''}
                                <span className="badge bg-secondary ms-2">{vol.countOfIssues} issues</span>
                            </span>
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleSelect(vol)}
                                disabled={seeding}
                            >
                                {seeding ? 'Adding\u2026' : 'Add'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={seeding}>
                Cancel
            </button>
        </div>
    );
};

export default SeriesCreator;


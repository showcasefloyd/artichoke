import React, { useEffect, useState } from 'react';
import PublisherList from './PublisherList';

export interface Publisher {
    id: number;
    name: string;
    series_count?: number;
}

export interface SeriesType {
    id: number;
    name: string;
}

const App: React.FC = () => {
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('/publishers')
            .then(res => { if (!res.ok) throw new Error(`Failed to load publishers (${res.status})`); return res.json(); })
            .then(data => {
                setPublishers(data.publishers ?? []);
                setLoading(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoading(false);
            });
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-12">
                    <h3 className="page-header">[ Artichoke, Comic Book Database ]</h3>
                    <div className="page-header-menu"><a className="btn btn-warning" href="/admin">Admin</a></div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <h4>Publishers</h4>
                    <PublisherList publishers={publishers} loading={loading} error={error} />
                </div>
            </div>
        </div>
    );
};

export default App;

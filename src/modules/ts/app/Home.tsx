import React, { useEffect, useState } from 'react';
import PublisherList from './PublisherList';
import Dashboard from './Dashboard';
import type { Publisher, Series } from './App';

const Home: React.FC = () => {
    const [publishers, setPublishers]               = useState<Publisher[]>([]);
    const [loading, setLoading]                     = useState(true);
    const [error, setError]                         = useState('');

    const [selectedPublisherId, setSelectedPublisherId] = useState<number | null>(null);
    const [series, setSeries]                           = useState<Series[]>([]);
    const [seriesLoading, setSeriesLoading]             = useState(false);

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

    const handlePublisherClick = (id: number) => {
        if (selectedPublisherId === id) {
            setSelectedPublisherId(null);
            setSeries([]);
            return;
        }
        setSelectedPublisherId(id);
        setSeries([]);
        setSeriesLoading(true);
        fetch(`/publishers/${id}/series`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load series (${res.status})`); return res.json(); })
            .then(data => {
                setSeries(data.series ?? []);
                setSeriesLoading(false);
            })
            .catch(() => {
                setSeriesLoading(false);
            });
    };

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
                    <Dashboard />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <h4>Publishers</h4>
                    <PublisherList
                        publishers={publishers}
                        loading={loading}
                        error={error}
                        selectedPublisherId={selectedPublisherId}
                        series={series}
                        seriesLoading={seriesLoading}
                        onPublisherClick={handlePublisherClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;

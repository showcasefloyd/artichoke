import React from 'react';
import { Publisher } from './App';

interface Props {
    publishers: Publisher[];
    loading: boolean;
    error: string;
}

const PublisherList: React.FC<Props> = ({ publishers, loading, error }) => {
    if (loading) return <p>Loading publishers&hellip;</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (publishers.length === 0) return <p className="text-muted">No publishers found.</p>;

    return (
        <ul className="list-group">
            {publishers.map(p => (
                <li key={p.id} className="list-group-item">{p.name}</li>
            ))}
        </ul>
    );
};

export default PublisherList;

import React from 'react';
import { Link } from 'react-router-dom';
import { Publisher, Series } from './App';

interface Props {
    publishers: Publisher[];
    loading: boolean;
    error: string;
    selectedPublisherId: number | null;
    series: Series[];
    seriesLoading: boolean;
    onPublisherClick: (id: number) => void;
}

const PublisherList: React.FC<Props> = ({
    publishers,
    loading,
    error,
    selectedPublisherId,
    series,
    seriesLoading,
    onPublisherClick,
}) => {
    if (loading) return <p>Loading publishers&hellip;</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (publishers.length === 0) return <p className="text-muted">No publishers found.</p>;

    return (
        <ul className="list-group">
            {publishers.map(p => (
                <li key={p.id} className="list-group-item p-0">
                    <button
                        className="btn btn-link w-100 text-start px-3 py-2"
                        onClick={() => onPublisherClick(p.id)}
                        aria-expanded={selectedPublisherId === p.id}
                    >
                        {p.name}
                    </button>
                    {selectedPublisherId === p.id && (
                        <div className="px-3 pb-2">
                            {seriesLoading && <p className="text-muted mb-1">Loading series&hellip;</p>}
                            {!seriesLoading && series.length === 0 && (
                                <p className="text-muted mb-1">No series found.</p>
                            )}
                            {!seriesLoading && series.length > 0 && (
                                <ul className="list-unstyled mb-1">
                                    {series.map(s => (
                                        <li key={s.id} className="d-flex align-items-center gap-2 py-1">
                                            <Link to={`/series/${s.id}`}>
                                                {s.name}
                                                {s.volume ? ` Vol. ${s.volume}` : ''}
                                                {s.startYear ? ` (${s.startYear})` : ''}
                                            </Link>
                                            <span className="badge bg-secondary">
                                                {s.ownedCount}/{s.totalIssues}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default PublisherList;

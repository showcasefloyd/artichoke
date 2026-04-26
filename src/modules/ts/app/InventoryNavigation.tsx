import React from 'react';
import { IssueListItem, Publisher, SeriesListItem } from './App';

import './InventoryColumn.scss';

interface InventoryNavigationProps {
    publishers: Publisher[];
    series: SeriesListItem[];
    issues: IssueListItem[];
    selectedPublisherId: number | null;
    selectedSeriesId: number | null;
    selectedIssueId: number | null;
    loadingPublishers: boolean;
    loadingSeries: boolean;
    loadingIssues: boolean;
    onPublisherClick: (id: number) => void;
    onSeriesClick: (id: number) => void;
    onIssueClick: (id: number) => void;
}

function formatSeriesProgress(book: SeriesListItem): string {
    const owned = typeof book.issueCount === 'number' ? book.issueCount : 0;
    const total = typeof book.totalIssues === 'number' ? book.totalIssues : 0;
    if (total <= 0) {
        return '';
    }
    const missing = typeof book.missingIssues === 'number' ? book.missingIssues : Math.max(total - owned, 0);
    const completion = typeof book.completionPercent === 'number'
        ? book.completionPercent
        : Math.min(Math.round((owned / total) * 100), 100);
    return ` — ${owned}/${total} (${completion}% complete, ${missing} missing)`;
}

const InventoryNavigation: React.FC<InventoryNavigationProps> = ({
    publishers,
    series,
    issues,
    selectedPublisherId,
    selectedSeriesId,
    selectedIssueId,
    loadingPublishers,
    loadingSeries,
    loadingIssues,
    onPublisherClick,
    onSeriesClick,
    onIssueClick,
}) => (
    <>
        <div className="col-4 inventory-column">
            <h3>Publishers</h3>
            {loadingPublishers ? (
                <p>Loading...</p>
            ) : (
                <ul className="list-group inventory-overflow">
                    {publishers.map(publisher => (
                        <li key={publisher.id} className="list-group-item">
                            <button
                                type="button"
                                className={`inventory-item-btn${selectedPublisherId === publisher.id ? ' active' : ''}`}
                                onClick={() => onPublisherClick(publisher.id)}
                            >
                                {publisher.name}
                                {typeof publisher.title_count === 'number' ? ` (${publisher.title_count})` : ''}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div className="col-4 inventory-column">
            <h3>Series</h3>
            {loadingSeries ? (
                <p>Loading...</p>
            ) : (
                <ul className="list-group inventory-overflow">
                    {series.map(book => (
                        <li key={book.id} className="list-group-item">
                            <button
                                type="button"
                                className={`inventory-item-btn${selectedSeriesId === book.id ? ' active' : ''}`}
                                onClick={() => onSeriesClick(book.id)}
                            >
                                {book.name}
                                {book.volume > 0 ? ` Vol. ${book.volume}` : ''}
                                {book.startYear > 0 ? ` (${book.startYear})` : ''}
                                {formatSeriesProgress(book)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div className="col-4 inventory-column">
            <h3>Issues</h3>
            {loadingIssues ? (
                <p>Loading...</p>
            ) : (
                <ul className="list-group inventory-overflow">
                    {issues.map(issue => (
                        <li key={issue.id} className="list-group-item">
                            <button
                                type="button"
                                className={`inventory-item-btn${selectedIssueId === issue.id ? ' active' : ''}`}
                                onClick={() => onIssueClick(issue.id)}
                            >
                                #{issue.number}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </>
);

export default InventoryNavigation;

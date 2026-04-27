import React, { useState, useCallback } from 'react';
import './PublicationGridExplorer.scss';

// Types for ComicVine API responses
interface ComicVineVolume {
    cv_id: number;
    name: string;
    start_year: string | null;
    issue_count: number;
    publisher: string | null;
    image: string | null;
    deck: string | null;
    legacy_start: number;
    legacy_end: number;
}

interface ComicVineIssue {
    cv_id: number;
    issue_number: string | null;
    name: string | null;
    cover_date: string | null;
    image: string | null;
}

interface TitleHistoryResponse {
    found: boolean;
    titleName: string;
    totalIssues: number;
    volumeCount: number;
    volumes: ComicVineVolume[];
    attribution: {
        text: string;
        url: string;
    };
}

interface VolumeIssuesResponse {
    cvVolumeId: number;
    issueCount: number;
    issues: {
        issues: ComicVineIssue[];
        total: number;
    };
    attribution: {
        text: string;
        url: string;
    };
}

// Color palette for volumes (distinct, accessible colors)
const VOLUME_COLORS = [
    '#3498db', // Blue
    '#27ae60', // Green
    '#9b59b6', // Purple
    '#e67e22', // Orange
    '#e74c3c', // Red
    '#1abc9c', // Teal
    '#f39c12', // Yellow
    '#34495e', // Dark gray
    '#16a085', // Dark teal
    '#8e44ad', // Dark purple
    '#d35400', // Dark orange
    '#c0392b', // Dark red
    '#2980b9', // Dark blue
    '#27ae60', // Emerald
    '#7f8c8d', // Gray
];

interface Props {
    /** User's owned issue IDs from local collection (cv_issue_id values) */
    ownedIssueIds?: Set<number>;
    /** Callback when an issue is clicked */
    onIssueClick?: (cvIssueId: number, volumeId: number, issueNumber: string) => void;
}

const PublicationGridExplorer: React.FC<Props> = ({ 
    ownedIssueIds = new Set(), 
    onIssueClick 
}) => {
    const [searchTitle, setSearchTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [titleHistory, setTitleHistory] = useState<TitleHistoryResponse | null>(null);
    const [volumeIssues, setVolumeIssues] = useState<Map<number, ComicVineIssue[]>>(new Map());
    const [loadingVolumes, setLoadingVolumes] = useState<Set<number>>(new Set());
    const [expandedVolumes, setExpandedVolumes] = useState<Set<number>>(new Set());
    const [highlightedIssue, setHighlightedIssue] = useState<number | null>(null);

    const searchTitleHistory = useCallback(async () => {
        if (!searchTitle.trim()) return;

        setLoading(true);
        setError(null);
        setTitleHistory(null);
        setVolumeIssues(new Map());
        setExpandedVolumes(new Set());

        try {
            const response = await fetch(`/api/comicvine/title-history/${encodeURIComponent(searchTitle.trim())}`);
            if (!response.ok) {
                throw new Error(`Failed to search (${response.status})`);
            }
            const data: TitleHistoryResponse = await response.json();
            
            if (!data.found) {
                setError(`No volumes found for "${searchTitle}"`);
            } else {
                setTitleHistory(data);
            }
        } catch (e) {
            setError(String(e instanceof Error ? e.message : e));
        } finally {
            setLoading(false);
        }
    }, [searchTitle]);

    const loadVolumeIssues = useCallback(async (volumeId: number) => {
        if (volumeIssues.has(volumeId) || loadingVolumes.has(volumeId)) return;

        setLoadingVolumes(prev => new Set(prev).add(volumeId));

        try {
            const response = await fetch(`/api/comicvine/volume/${volumeId}/issues`);
            if (!response.ok) {
                throw new Error(`Failed to load issues (${response.status})`);
            }
            const data: VolumeIssuesResponse = await response.json();
            
            setVolumeIssues(prev => {
                const next = new Map(prev);
                next.set(volumeId, data.issues.issues);
                return next;
            });
        } catch (e) {
            console.error('Failed to load volume issues:', e);
        } finally {
            setLoadingVolumes(prev => {
                const next = new Set(prev);
                next.delete(volumeId);
                return next;
            });
        }
    }, [volumeIssues, loadingVolumes]);

    const toggleVolumeExpand = useCallback((volumeId: number) => {
        setExpandedVolumes(prev => {
            const next = new Set(prev);
            if (next.has(volumeId)) {
                next.delete(volumeId);
            } else {
                next.add(volumeId);
                // Load issues when expanding
                loadVolumeIssues(volumeId);
            }
            return next;
        });
    }, [loadVolumeIssues]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchTitleHistory();
        }
    };

    const getVolumeColor = (index: number): string => {
        return VOLUME_COLORS[index % VOLUME_COLORS.length];
    };

    const formatPublisher = (publisher: string | null, startYear: string | null): string => {
        const parts = [];
        if (publisher) parts.push(publisher);
        if (startYear) parts.push(`(${startYear})`);
        return parts.join(' ') || 'Unknown';
    };

    return (
        <div className="publication-grid-explorer">
            <div className="explorer-header">
                <h4>Publication Grid Explorer</h4>
                <p className="text-muted">
                    Search for a comic title to see its complete publication history across all volumes.
                </p>
            </div>

            <div className="search-form">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter title name (e.g., Batman, Spider-Man)"
                        value={searchTitle}
                        onChange={e => setSearchTitle(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={searchTitleHistory}
                        disabled={loading || !searchTitle.trim()}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-warning mt-3" role="alert">
                    {error}
                </div>
            )}

            {titleHistory && (
                <div className="title-history mt-4">
                    <div className="history-summary">
                        <h5>{titleHistory.titleName}</h5>
                        <p>
                            <strong>{titleHistory.totalIssues.toLocaleString()}</strong> issues across{' '}
                            <strong>{titleHistory.volumeCount}</strong> volumes
                        </p>
                    </div>

                    {/* Volume Legend */}
                    <div className="volume-legend">
                        {titleHistory.volumes.map((volume, index) => (
                            <div 
                                key={volume.cv_id} 
                                className="legend-item"
                                onClick={() => toggleVolumeExpand(volume.cv_id)}
                            >
                                <span 
                                    className="legend-color" 
                                    style={{ backgroundColor: getVolumeColor(index) }}
                                />
                                <span className="legend-label">
                                    Vol {index + 1}: {formatPublisher(volume.publisher, volume.start_year)}
                                    <span className="legend-count">({volume.issue_count} issues)</span>
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Publication Grid */}
                    <div className="publication-grid">
                        {titleHistory.volumes.map((volume, volumeIndex) => {
                            const color = getVolumeColor(volumeIndex);
                            const issues = volumeIssues.get(volume.cv_id);
                            const isExpanded = expandedVolumes.has(volume.cv_id);
                            const isLoading = loadingVolumes.has(volume.cv_id);

                            return (
                                <div key={volume.cv_id} className="volume-section">
                                    <div 
                                        className="volume-header"
                                        onClick={() => toggleVolumeExpand(volume.cv_id)}
                                        style={{ borderLeftColor: color }}
                                    >
                                        <span className="volume-name">
                                            Vol {volumeIndex + 1}: {volume.name} 
                                            {volume.start_year && ` (${volume.start_year})`}
                                        </span>
                                        <span className="volume-info">
                                            {volume.publisher && <span className="publisher">{volume.publisher}</span>}
                                            <span className="issue-range">
                                                Legacy #{volume.legacy_start}–{volume.legacy_end}
                                            </span>
                                            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div className="volume-issues">
                                            {isLoading && (
                                                <div className="loading-issues">Loading issues...</div>
                                            )}
                                            {!isLoading && issues && (
                                                <div className="issue-squares">
                                                    {issues.map((issue, issueIndex) => {
                                                        const legacyNumber = volume.legacy_start + issueIndex;
                                                        const isOwned = ownedIssueIds.has(issue.cv_id);
                                                        const isHighlighted = highlightedIssue === issue.cv_id;

                                                        return (
                                                            <div
                                                                key={issue.cv_id}
                                                                className={`issue-square ${isOwned ? 'owned' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                                                                style={{ backgroundColor: color }}
                                                                title={`#${issue.issue_number || '?'} - ${issue.name || 'Untitled'}\nLegacy #${legacyNumber}\n${issue.cover_date || 'Unknown date'}`}
                                                                onClick={() => {
                                                                    setHighlightedIssue(issue.cv_id);
                                                                    onIssueClick?.(issue.cv_id, volume.cv_id, issue.issue_number || '');
                                                                }}
                                                                onMouseEnter={() => setHighlightedIssue(issue.cv_id)}
                                                                onMouseLeave={() => setHighlightedIssue(null)}
                                                            >
                                                                {isOwned && <span className="owned-mark">✓</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {!isLoading && !issues && (
                                                <div className="no-issues">No issues loaded</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Attribution */}
                    {titleHistory.attribution && (
                        <div className="attribution">
                            <a href={titleHistory.attribution.url} target="_blank" rel="noopener noreferrer">
                                {titleHistory.attribution.text}
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PublicationGridExplorer;

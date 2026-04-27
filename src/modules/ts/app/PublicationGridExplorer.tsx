import React, { useState, useCallback, useMemo } from 'react';
import './PublicationGridExplorer.scss';

// Major US comic publishers
const US_PUBLISHERS = new Set([
    'DC Comics',
    'Marvel',
    'Image',
    'Dark Horse Comics',
    'IDW Publishing',
    'Valiant',
    'Boom! Studios',
    'Dynamite Entertainment',
    'Archie Comics',
    'Oni Press',
    'Top Cow',
    'Vertigo',
    'WildStorm',
    'America\'s Best Comics',
    'Icon Comics',
    'MAX',
    'DC Black Label',
]);

type PublisherFilter = 'us' | 'all' | string;

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
    /** Initial owned issue IDs from local collection (cv_issue_id values) */
    initialOwnedIssueIds?: Set<number>;
}

interface QuickAddResponse {
    success?: boolean;
    alreadyOwned?: boolean;
    issueId?: number;
    message?: string;
    error?: string;
}

const PublicationGridExplorer: React.FC<Props> = ({ 
    initialOwnedIssueIds = new Set()
}) => {
    const [searchTitle, setSearchTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [titleHistory, setTitleHistory] = useState<TitleHistoryResponse | null>(null);
    const [volumeIssues, setVolumeIssues] = useState<Map<number, ComicVineIssue[]>>(new Map());
    const [loadingVolumes, setLoadingVolumes] = useState<Set<number>>(new Set());
    const [expandedVolumes, setExpandedVolumes] = useState<Set<number>>(new Set());
    const [highlightedIssue, setHighlightedIssue] = useState<number | null>(null);
    const [publisherFilter, setPublisherFilter] = useState<PublisherFilter>('us');
    
    // Track owned issues locally (merged with props)
    const [ownedIssueIds, setOwnedIssueIds] = useState<Set<number>>(initialOwnedIssueIds);
    const [addingIssue, setAddingIssue] = useState<number | null>(null);
    const [lastAddedMessage, setLastAddedMessage] = useState<string | null>(null);

    // Get unique publishers from results for the filter dropdown
    const availablePublishers = useMemo(() => {
        if (!titleHistory) return [];
        const publishers = new Set<string>();
        titleHistory.volumes.forEach(v => {
            if (v.publisher) publishers.add(v.publisher);
        });
        return Array.from(publishers).sort();
    }, [titleHistory]);

    // Filter volumes based on publisher selection and recalculate legacy numbers
    const filteredVolumes = useMemo(() => {
        if (!titleHistory) return [];
        
        let volumes = titleHistory.volumes;
        
        // Apply publisher filter
        if (publisherFilter === 'us') {
            volumes = volumes.filter(v => v.publisher && US_PUBLISHERS.has(v.publisher));
        } else if (publisherFilter !== 'all') {
            // Filter to specific publisher
            volumes = volumes.filter(v => v.publisher === publisherFilter);
        }
        
        // Recalculate legacy numbers for filtered set
        let runningTotal = 0;
        return volumes.map(vol => {
            const legacy_start = runningTotal + 1;
            const legacy_end = runningTotal + vol.issue_count;
            runningTotal += vol.issue_count;
            return { ...vol, legacy_start, legacy_end };
        });
    }, [titleHistory, publisherFilter]);

    // Calculate totals for filtered results
    const filteredTotals = useMemo(() => {
        const totalIssues = filteredVolumes.reduce((sum, v) => sum + v.issue_count, 0);
        return { totalIssues, volumeCount: filteredVolumes.length };
    }, [filteredVolumes]);

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

    const quickAddIssue = useCallback(async (
        cvIssueId: number,
        volume: ComicVineVolume,
        issue: ComicVineIssue
    ) => {
        if (addingIssue || ownedIssueIds.has(cvIssueId)) return;
        
        setAddingIssue(cvIssueId);
        setLastAddedMessage(null);
        
        try {
            const response = await fetch('/api/comicvine/quick-add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cvVolumeId: volume.cv_id,
                    cvIssueId: issue.cv_id,
                    titleName: titleHistory?.titleName || volume.name,
                    volumeName: volume.name,
                    publisher: volume.publisher,
                    startYear: volume.start_year ? parseInt(volume.start_year, 10) : null,
                    issueNumber: issue.issue_number,
                    coverDate: issue.cover_date,
                    issueName: issue.name
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to add issue (${response.status})`);
            }
            
            const data: QuickAddResponse = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (data.success) {
                // Add to local owned set
                setOwnedIssueIds(prev => new Set(prev).add(cvIssueId));
                setLastAddedMessage(data.message || `Added #${issue.issue_number}`);
                
                // Clear message after 3 seconds
                setTimeout(() => setLastAddedMessage(null), 3000);
            }
        } catch (e) {
            setError(String(e instanceof Error ? e.message : e));
        } finally {
            setAddingIssue(null);
        }
    }, [addingIssue, ownedIssueIds, titleHistory]);

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

            {lastAddedMessage && (
                <div className="alert alert-success mt-3 added-toast" role="alert">
                    {lastAddedMessage}
                </div>
            )}

            {titleHistory && (
                <div className="title-history mt-4">
                    <div className="history-summary">
                        <h5>{titleHistory.titleName}</h5>
                        <div className="summary-row">
                            <p>
                                <strong>{filteredTotals.totalIssues.toLocaleString()}</strong> issues across{' '}
                                <strong>{filteredTotals.volumeCount}</strong> volumes
                                {publisherFilter !== 'all' && titleHistory.volumeCount !== filteredTotals.volumeCount && (
                                    <span className="text-muted ms-2">
                                        (filtered from {titleHistory.volumeCount} total)
                                    </span>
                                )}
                            </p>
                            <div className="publisher-filter">
                                <label htmlFor="publisher-filter" className="form-label me-2">Publisher:</label>
                                <select
                                    id="publisher-filter"
                                    className="form-select form-select-sm"
                                    value={publisherFilter}
                                    onChange={e => setPublisherFilter(e.target.value as PublisherFilter)}
                                >
                                    <option value="us">US Publishers Only</option>
                                    <option value="all">All Publishers ({titleHistory.volumeCount})</option>
                                    <optgroup label="Specific Publisher">
                                        {availablePublishers.map(pub => (
                                            <option key={pub} value={pub}>{pub}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>

                    {filteredVolumes.length === 0 && (
                        <div className="alert alert-info">
                            No volumes found for selected publisher filter. Try selecting "All Publishers".
                        </div>
                    )}

                    {/* Volume Legend */}
                    {filteredVolumes.length > 0 && (
                    <div className="volume-legend">
                        {filteredVolumes.map((volume, index) => (
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
                    )}

                    {/* Publication Grid */}
                    <div className="publication-grid">
                        {filteredVolumes.map((volume, volumeIndex) => {
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
                                                        const isAdding = addingIssue === issue.cv_id;

                                                        return (
                                                            <div
                                                                key={issue.cv_id}
                                                                className={`issue-square ${isOwned ? 'owned' : ''} ${isHighlighted ? 'highlighted' : ''} ${isAdding ? 'adding' : ''}`}
                                                                style={{ backgroundColor: color }}
                                                                title={`#${issue.issue_number || '?'} - ${issue.name || 'Untitled'}\nLegacy #${legacyNumber}\n${issue.cover_date || 'Unknown date'}${isOwned ? '\n✓ In Collection' : '\nClick to add to collection'}`}
                                                                onClick={() => {
                                                                    if (!isOwned && !isAdding) {
                                                                        quickAddIssue(issue.cv_id, volume, issue);
                                                                    }
                                                                }}
                                                                onMouseEnter={() => setHighlightedIssue(issue.cv_id)}
                                                                onMouseLeave={() => setHighlightedIssue(null)}
                                                            >
                                                                {isOwned && <span className="owned-mark">✓</span>}
                                                                {isAdding && <span className="adding-mark">+</span>}
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

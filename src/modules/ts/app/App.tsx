import React, { useEffect, useState } from 'react';
import IssueDetail from './IssueDetail';
import IssueGrid from './IssueGrid';
import InventoryNavigation from './InventoryNavigation';
import CollectorDashboard from './CollectorDashboard';

export interface Title {
    id: number;
    name: string;
}

export interface SeriesBook {
    id: number;
    title: string;
}

export interface SeriesResponse {
    series_id: number;
    series: SeriesBook[];
}

export interface IssueGridItem {
    issue: string;
    own: 'Y' | 'N';
    issue_id?: number;
}

export interface SeriesGridResponse {
    seriesId: number;
    firstIssue: number | null;
    finalIssue: number | null;
    totalIssues: number;
    gridable: boolean;
    issues: IssueGridItem[];
}

export interface Publisher {
    id: number;
    name: string;
    title_count?: number;
}

export interface SeriesType {
    id: number;
    name: string;
}

export interface SeriesListItem {
    id: number;
    titleId: number;
    name: string;
    volume: number;
    startYear: number;
    publisher: string;
    titleName: string;
    issueCount?: number;
    totalIssues?: number;
    missingIssues?: number;
    completionPercent?: number;
}

export interface IssueListItem {
    id: number;
    number: string;
    seriesId: number;
    seriesName: string;
    titleId: number;
    titleName: string;
}

export interface IssueDetail {
    number: string;
    storytitle: string;
    printrun: string;
    coverdate: string;
    type: string;
    location: string;
    quantity: string;
    status: string;
    condition: string;
    coverprice: string;
    purchaseprice: string;
    priceguidevalue: string;
    issuevalue: string;
    purchasedate: string;
    priceguide: string;
    comments: string;
}

export interface DashboardStatusItem {
    status: string;
    count: number;
}

export interface DashboardCountItem {
    name: string;
    issueCount: number;
}

export interface DashboardResponse {
    totals: {
        publishers: number;
        titles: number;
        series: number;
        issuesOwned: number;
    };
    values: {
        issueValue: number;
        purchasePrice: number;
        coverPrice: number;
    };
    statusBreakdown: DashboardStatusItem[];
    topPublishers: DashboardCountItem[];
    topTitles: DashboardCountItem[];
    missing: {
        estimatedMissingIssues: number;
        seriesWithGaps: number;
    };
}

const App: React.FC = () => {
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [series, setSeries] = useState<SeriesListItem[]>([]);
    const [issues, setIssues] = useState<IssueListItem[]>([]);
    const [seriesGrid, setSeriesGrid] = useState<SeriesGridResponse | null>(null);
    const [selectedPublisherId, setSelectedPublisherId] = useState<number | null>(null);
    const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
    const [loadingPublishers, setLoadingPublishers] = useState<boolean>(true);
    const [loadingSeries, setLoadingSeries] = useState<boolean>(false);
    const [loadingIssues, setLoadingIssues] = useState<boolean>(false);
    const [loadingIssueDetail, setLoadingIssueDetail] = useState<boolean>(false);
    const [loadingSeriesGrid, setLoadingSeriesGrid] = useState<boolean>(false);
    const [showGridModal, setShowGridModal] = useState<boolean>(false);
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);
    const [issue, setIssue] = useState<IssueDetail | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setLoadingPublishers(true);
        fetch('/publishers')
            .then(res => { if (!res.ok) throw new Error(`Failed to load publishers (${res.status})`); return res.json(); })
            .then(data => {
                const publisherList: Publisher[] = data.publishers ?? [];
                setPublishers(publisherList.filter(publisher => (publisher.title_count ?? 0) > 0));
                setLoadingPublishers(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoadingPublishers(false);
            });

        setLoadingDashboard(true);
        fetch('/dashboard')
            .then(res => { if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`); return res.json(); })
            .then(data => {
                setDashboard(data);
                setLoadingDashboard(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoadingDashboard(false);
            });
    }, []);

    const grabSeries = (publisherId: number) => {
        setSelectedPublisherId(publisherId);
        setSelectedSeriesId(null);
        setSelectedIssueId(null);
        setSeries([]);
        setIssues([]);
        setSeriesGrid(null);
        setShowGridModal(false);
        setIssue(null);
        setError('');
        setLoadingSeries(true);

        fetch(`/series?publisherId=${publisherId}&minimumIssueCount=1`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load series (${res.status})`); return res.json(); })
            .then(data => {
                const seriesList: SeriesListItem[] = data.series ?? [];
                setSeries(seriesList.filter(book => (book.issueCount ?? 0) > 0));
                setLoadingSeries(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoadingSeries(false);
            });
    };

    const grabIssues = (seriesId: number) => {
        setSelectedSeriesId(seriesId);
        setSelectedIssueId(null);
        setIssue(null);
        setIssues([]);
        setSeriesGrid(null);
        setShowGridModal(false);
        setError('');
        setLoadingIssues(true);
        setLoadingSeriesGrid(true);

        fetch(`/issues?seriesId=${seriesId}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load issues (${res.status})`); return res.json(); })
            .then(data => {
                setIssues(data.issues ?? []);
                setLoadingIssues(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoadingIssues(false);
            });

        fetch(`/series/${seriesId}/grid`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load series grid (${res.status})`); return res.json(); })
            .then(data => {
                setSeriesGrid(data);
                setLoadingSeriesGrid(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoadingSeriesGrid(false);
            });
    };

    const grabIssue = (id: number) => {
        setSelectedIssueId(id);
        setError('');
        setLoadingIssueDetail(true);
        fetch(`/issue/${id}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load issue (${res.status})`); return res.json(); })
            .then(data => {
                setIssue(data);
                setLoadingIssueDetail(false);
            })
            .catch(e => {
                setError(String(e.message ?? e));
                setLoadingIssueDetail(false);
            });
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col">
                    <h3 className="page-header">[ Artichoke, Comic Book Database &gt;&gt; Catalogue ]</h3>
                    <div className="page-header-menu"><a className="btn btn-warning" href="/admin">Admin</a></div>
                </div>
            </div>

            {error && (
                <div className="row">
                    <div className="col">
                        <div className="alert alert-danger" role="alert">{error}</div>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col">
                    <CollectorDashboard data={dashboard} loading={loadingDashboard} />
                </div>
            </div>

            <div className="row">
                <InventoryNavigation
                    publishers={publishers}
                    series={series}
                    issues={issues}
                    selectedPublisherId={selectedPublisherId}
                    selectedSeriesId={selectedSeriesId}
                    selectedIssueId={selectedIssueId}
                    loadingPublishers={loadingPublishers}
                    loadingSeries={loadingSeries}
                    loadingIssues={loadingIssues}
                    onPublisherClick={grabSeries}
                    onSeriesClick={grabIssues}
                    onIssueClick={grabIssue}
                />
            </div>

            <div className="row">
                <div className="col">
                    <div id="main-bottom">
                        <div className="series-grid-controls">
                            {selectedSeriesId && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowGridModal(true)}
                                >
                                    See Grid
                                </button>
                            )}
                            {selectedSeriesId && issues.length === 0 && !loadingIssues && (
                                <p className="mb-0 mt-2">No owned issues found for this series.</p>
                            )}
                        </div>
                        <div className="issue-detail">
                            {selectedIssueId && loadingIssueDetail && (
                                <p>Loading issue detail...</p>
                            )}
                            {issue && <IssueDetail issue={issue} />}
                        </div>

                    </div>
                </div>
            </div>
            {showGridModal && selectedSeriesId && (
                <>
                    <div
                        className="modal fade show d-block issue-grid-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="series-grid-modal-title"
                        onClick={() => setShowGridModal(false)}
                    >
                        <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="series-grid-modal-title">ComicBook Series Grid</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={() => setShowGridModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    {loadingSeriesGrid && (
                                        <p>Loading series grid...</p>
                                    )}
                                    {!loadingSeriesGrid && seriesGrid && !seriesGrid.gridable && (
                                        <p>Series grid unavailable (requires at least 2 numbered issues).</p>
                                    )}
                                    {seriesGrid && seriesGrid.gridable && (
                                        <IssueGrid issues={seriesGrid.issues} onIssueClick={grabIssue} showTitle={false} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}
        </div>
    );
};

export default App;

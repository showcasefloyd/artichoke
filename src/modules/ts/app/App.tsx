import React, { useEffect, useState } from 'react';
import TitleList from './TitleList';
import IssueGrid from './IssueGrid';
import IssueDetail from './IssueDetail';

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
    issue_id: number;
}

export interface Publisher {
    id: number;
    name: string;
}

export interface IssueDetail {
    number: string;
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

const App: React.FC = () => {
    const [titles, setTitles] = useState<Title[]>([]);
    const [openTitleId, setOpenTitleId] = useState<number | null>(null);
    const [seriesData, setSeriesData] = useState<SeriesResponse | null>(null);
    const [issues, setIssues] = useState<IssueGridItem[]>([]);
    const [issue, setIssue] = useState<IssueDetail | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetch('/list')
            .then(res => { if (!res.ok) throw new Error(`Failed to load titles (${res.status})`); return res.json(); })
            .then(data => setTitles(data.titles ?? []))
            .catch(e => setError(String(e.message ?? e)));
    }, []);

    const grabSeries = (id: number) => {
        setOpenTitleId(id);
        setIssues([]);
        setIssue(null);
        setError('');
        fetch(`/list/${id}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load series (${res.status})`); return res.json(); })
            .then(data => setSeriesData(data))
            .catch(e => setError(String(e.message ?? e)));
    };

    const grabIssues = (id: number) => {
        setIssue(null);
        setError('');
        fetch(`/issues/${id}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load issues (${res.status})`); return res.json(); })
            .then(data => setIssues(data))
            .catch(e => setError(String(e.message ?? e)));
    };

    const grabIssue = (id: number) => {
        setError('');
        fetch(`/issue/${id}`)
            .then(res => { if (!res.ok) throw new Error(`Failed to load issue (${res.status})`); return res.json(); })
            .then(data => setIssue(data))
            .catch(e => setError(String(e.message ?? e)));
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col">
                    <h3 className="page-header">[ Artichoke, Comic Book Database &gt;&gt; Catalogue ]</h3>
                    <div className="page-header-menu"><a href="/admin">Admin</a></div>
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
                <div className="col-3">
                    <TitleList
                        titles={titles}
                        openTitleId={openTitleId}
                        seriesData={seriesData}
                        onTitleClick={grabSeries}
                        onSeriesClick={grabIssues}
                    />
                </div>

                <div className="col-9">
                    <div id="main-top">
                        <IssueGrid issues={issues} onIssueClick={grabIssue} />
                    </div>
                    <div id="main-bottom">
                        {issue && <IssueDetail issue={issue} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;

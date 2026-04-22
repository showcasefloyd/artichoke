import React, { useEffect, useState } from 'react';
import TitleList from './TitleList';
import IssueGrid from './IssueGrid';

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

    useEffect(() => {
        fetch('/list')
            .then(res => res.json())
            .then(data => setTitles(data.titles ?? []));
    }, []);

    const grabSeries = (id: number) => {
        setOpenTitleId(id);
        setIssues([]);
        setIssue(null);
        fetch(`/list/${id}`)
            .then(res => res.json())
            .then(data => setSeriesData(data));
    };

    const grabIssues = (id: number) => {
        setIssue(null);
        fetch(`/issues/${id}`)
            .then(res => res.json())
            .then(data => setIssues(data));
    };

    const grabIssue = (id: number) => {
        fetch(`/issue/${id}`)
            .then(res => res.json())
            .then(data => setIssue(data));
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-12">
                    <h3 className="page-header">[ Artichoke, Comic Book Database &gt;&gt; Catalogue ]</h3>
                    <div className="page-header-menu"><a href="/admin">Admin</a></div>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-3" id="left-menu">
                    <TitleList
                        titles={titles}
                        openTitleId={openTitleId}
                        seriesData={seriesData}
                        onTitleClick={grabSeries}
                        onSeriesClick={grabIssues}
                    />
                </div>

                <div className="col-sm-9">
                    <div id="main-top">
                        <IssueGrid issues={issues} onIssueClick={grabIssue} />
                    </div>
                    <div id="main-bottom">
                        {/* IssueDetail goes here */}
                        {issue && <p>IssueDetail placeholder — issue #{issue.number}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;

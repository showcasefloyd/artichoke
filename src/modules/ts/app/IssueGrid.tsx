import React from 'react';
import { IssueGridItem } from './App';

interface Props {
    issues: IssueGridItem[];
    onIssueClick: (id: number) => void;
}

const IssueGrid: React.FC<Props> = ({ issues, onIssueClick }) => {
    if (issues.length === 0) return null;

    return (
        <>
            <h3>ComicBook Series Grid</h3>
            <div id="comicgrid" className="clearfix">
                {issues.map((issue, index) => {
                    const issueId = issue.issue_id;
                    const isOwnedIssue = issue.own === 'Y' && typeof issueId === 'number' && issueId > 0;
                    return (
                        <div
                            key={`${issue.issue}-${index}`}
                            className={`issue-box${issue.own === 'Y' ? ' own' : ''}`}
                        >
                            {isOwnedIssue
                                ? <a href="#" onClick={e => { e.preventDefault(); onIssueClick(issueId); }}>{issue.issue}</a>
                                : <span>{issue.issue}</span>
                            }
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default IssueGrid;

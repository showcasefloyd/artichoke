import React from 'react';
import { IssueGridItem } from './App';

interface Props {
    issues: IssueGridItem[];
    onIssueClick: (id: number) => void;
    showTitle?: boolean;
}

const IssueGrid: React.FC<Props> = ({ issues, onIssueClick, showTitle = true }) => {
    if (issues.length === 0) return null;

    return (
        <>
            {showTitle && <h3>ComicBook Series Grid</h3>}
            <div className="issue-grid">
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

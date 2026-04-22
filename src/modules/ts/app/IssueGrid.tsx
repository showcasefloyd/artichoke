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
            <h3>Issues</h3>
            <div id="comicgrid" className="clearfix">
                {issues.map(issue => (
                    <div
                        key={issue.issue_id}
                        className={`issue-box${issue.own === 'Y' ? ' own' : ''}`}
                    >
                        {issue.own === 'Y'
                            ? <a href="#" onClick={e => { e.preventDefault(); onIssueClick(issue.issue_id); }}>{issue.issue}</a>
                            : <span>{issue.issue}</span>
                        }
                    </div>
                ))}
            </div>
        </>
    );
};

export default IssueGrid;

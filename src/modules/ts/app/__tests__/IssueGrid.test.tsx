import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import IssueGrid from '../IssueGrid';
import { IssueGridItem } from '../App';

const issues: IssueGridItem[] = [
    { issue_id: 1, issue: '1', own: 'Y' },
    { issue_id: 2, issue: '2', own: 'Y' },
    { issue_id: 3, issue: '3', own: 'N' },
];

describe('IssueGrid', () => {
    it('renders nothing when issues array is empty', () => {
        const { container } = render(<IssueGrid issues={[]} onIssueClick={jest.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders all issue numbers', () => {
        render(<IssueGrid issues={issues} onIssueClick={jest.fn()} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders owned issues as links', () => {
        render(<IssueGrid issues={issues} onIssueClick={jest.fn()} />);
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
    });

    it('renders unowned issues as plain text (no link)', () => {
        render(<IssueGrid issues={issues} onIssueClick={jest.fn()} />);
        // Issue 3 is unowned — should be a span, not a link
        const thirdIssue = screen.getByText('3');
        expect(thirdIssue.tagName).toBe('SPAN');
    });

    it('calls onIssueClick with correct id when an owned issue is clicked', async () => {
        const onIssueClick = jest.fn();
        render(<IssueGrid issues={issues} onIssueClick={onIssueClick} />);
        await userEvent.click(screen.getByText('1'));
        expect(onIssueClick).toHaveBeenCalledWith(1);
    });
});

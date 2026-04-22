import React from 'react';
import { IssueDetail as IssueDetailType } from './App';

interface Props {
    issue: IssueDetailType;
}

const rows: { label: string; key: keyof IssueDetailType }[] = [
    { label: 'Issue Number',     key: 'number' },
    { label: 'Print Run',        key: 'printrun' },
    { label: 'Cover Date',       key: 'coverdate' },
    { label: 'Issue Type',       key: 'type' },
    { label: 'Location',         key: 'location' },
    { label: 'Quantity',         key: 'quantity' },
    { label: 'Status',           key: 'status' },
    { label: 'Condition',        key: 'condition' },
    { label: 'Cover Price',      key: 'coverprice' },
    { label: 'Purchase Price',   key: 'purchaseprice' },
    { label: 'Price Guide Value',key: 'priceguidevalue' },
    { label: 'Issue Value',      key: 'issuevalue' },
    { label: 'Purchase Date',    key: 'purchasedate' },
    { label: 'Price Guide',      key: 'priceguide' },
    { label: 'Comments',         key: 'comments' },
];

const IssueDetail: React.FC<Props> = ({ issue }) => (
    <table className="table table-hover">
        <tbody>
            {rows.map(({ label, key }) => (
                <tr key={key}>
                    <td className="issue-key">{label}:</td>
                    <td className="issue-val">{issue[key]}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default IssueDetail;

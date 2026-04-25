import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InventoryNavigation from '../InventoryNavigation';
import { IssueListItem, Publisher, SeriesListItem } from '../App';

const publishers: Publisher[] = [
    { id: 1, name: 'DC', title_count: 2 },
    { id: 2, name: 'Marvel', title_count: 1 },
];

const series: SeriesListItem[] = [
    { id: 10, name: 'Batman Vol. 1', volume: 1, startYear: 1940, publisher: 'DC', titleId: 100, titleName: 'Batman' },
];

const issues: IssueListItem[] = [
    { id: 1000, number: '1', seriesId: 10, seriesName: 'Batman Vol. 1', titleId: 100, titleName: 'Batman' },
];

describe('InventoryNavigation', () => {
    it('renders all three Miller columns', () => {
        render(
            <InventoryNavigation
                publishers={publishers}
                series={series}
                issues={issues}
                selectedPublisherId={null}
                selectedSeriesId={null}
                selectedIssueId={null}
                loadingPublishers={false}
                loadingSeries={false}
                loadingIssues={false}
                onPublisherClick={jest.fn()}
                onSeriesClick={jest.fn()}
                onIssueClick={jest.fn()}
            />
        );

        expect(screen.getByText('Publishers')).toBeInTheDocument();
        expect(screen.getByText('Series')).toBeInTheDocument();
        expect(screen.getByText('Issues')).toBeInTheDocument();
    });

    it('calls selection callbacks when rows are clicked', async () => {
        const onPublisherClick = jest.fn();
        const onSeriesClick = jest.fn();
        const onIssueClick = jest.fn();

        render(
            <InventoryNavigation
                publishers={publishers}
                series={series}
                issues={issues}
                selectedPublisherId={null}
                selectedSeriesId={null}
                selectedIssueId={null}
                loadingPublishers={false}
                loadingSeries={false}
                loadingIssues={false}
                onPublisherClick={onPublisherClick}
                onSeriesClick={onSeriesClick}
                onIssueClick={onIssueClick}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: 'DC (2)' }));
        await userEvent.click(screen.getByRole('button', { name: /Batman Vol\. 1/ }));
        await userEvent.click(screen.getByRole('button', { name: '#1' }));

        expect(onPublisherClick).toHaveBeenCalledWith(1);
        expect(onSeriesClick).toHaveBeenCalledWith(10);
        expect(onIssueClick).toHaveBeenCalledWith(1000);
    });
});

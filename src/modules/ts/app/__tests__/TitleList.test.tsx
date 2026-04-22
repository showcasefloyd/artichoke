import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TitleList from '../TitleList';
import { Title, SeriesResponse } from '../App';

const titles: Title[] = [
    { id: 1, name: 'Batman' },
    { id: 2, name: 'Spider-Man' },
];

const seriesData: SeriesResponse = {
    series_id: 1,
    series: [
        { id: 10, title: 'Batman Vol 1' },
        { id: 11, title: 'Batman Vol 2' },
    ],
};

describe('TitleList', () => {
    it('renders all title names', () => {
        render(
            <TitleList
                titles={titles}
                openTitleId={null}
                seriesData={null}
                onTitleClick={jest.fn()}
                onSeriesClick={jest.fn()}
            />
        );
        expect(screen.getByText('Batman')).toBeInTheDocument();
        expect(screen.getByText('Spider-Man')).toBeInTheDocument();
    });

    it('calls onTitleClick with the correct id when a title is clicked', async () => {
        const onTitleClick = jest.fn();
        render(
            <TitleList
                titles={titles}
                openTitleId={null}
                seriesData={null}
                onTitleClick={onTitleClick}
                onSeriesClick={jest.fn()}
            />
        );
        await userEvent.click(screen.getByText('Batman'));
        expect(onTitleClick).toHaveBeenCalledWith(1);
    });

    it('renders series when seriesData matches the open title', () => {
        render(
            <TitleList
                titles={titles}
                openTitleId={1}
                seriesData={seriesData}
                onTitleClick={jest.fn()}
                onSeriesClick={jest.fn()}
            />
        );
        expect(screen.getByText('Batman Vol 1')).toBeInTheDocument();
        expect(screen.getByText('Batman Vol 2')).toBeInTheDocument();
    });

    it('does not render series for a different open title', () => {
        render(
            <TitleList
                titles={titles}
                openTitleId={2}
                seriesData={seriesData}
                onTitleClick={jest.fn()}
                onSeriesClick={jest.fn()}
            />
        );
        expect(screen.queryByText('Batman Vol 1')).not.toBeInTheDocument();
    });

    it('calls onSeriesClick with the correct id when a series is clicked', async () => {
        const onSeriesClick = jest.fn();
        render(
            <TitleList
                titles={titles}
                openTitleId={1}
                seriesData={seriesData}
                onTitleClick={jest.fn()}
                onSeriesClick={onSeriesClick}
            />
        );
        await userEvent.click(screen.getByText('Batman Vol 1'));
        expect(onSeriesClick).toHaveBeenCalledWith(10);
    });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PublisherList from '../PublisherList';
import { Publisher, Series } from '../App';

const publishers: Publisher[] = [
    { id: 1, name: 'Marvel' },
    { id: 2, name: 'DC' },
    { id: 3, name: 'Image' },
];

const seriesList: Series[] = [
    { id: 10, name: 'Daredevil', volume: 1, startYear: 1964, totalIssues: 380, ownedCount: 12 },
    { id: 11, name: 'Spider-Man', volume: null, startYear: null, totalIssues: 50, ownedCount: 0 },
];

const defaultProps = {
    publishers,
    loading: false,
    error: '',
    selectedPublisherId: null,
    series: [],
    seriesLoading: false,
    onPublisherClick: jest.fn(),
};

const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

describe('PublisherList', () => {
    it('shows loading message when loading', () => {
        renderWithRouter(<PublisherList {...defaultProps} loading={true} />);
        expect(screen.getByText(/loading publishers/i)).toBeInTheDocument();
    });

    it('shows error when error is provided', () => {
        renderWithRouter(<PublisherList {...defaultProps} error="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows empty message when no publishers', () => {
        renderWithRouter(<PublisherList {...defaultProps} publishers={[]} />);
        expect(screen.getByText(/no publishers found/i)).toBeInTheDocument();
    });

    it('renders publisher names as buttons', () => {
        renderWithRouter(<PublisherList {...defaultProps} />);
        expect(screen.getByRole('button', { name: 'Marvel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'DC' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Image' })).toBeInTheDocument();
    });

    it('calls onPublisherClick with the publisher id when clicked', async () => {
        const onPublisherClick = jest.fn();
        renderWithRouter(<PublisherList {...defaultProps} onPublisherClick={onPublisherClick} />);
        await userEvent.click(screen.getByRole('button', { name: 'Marvel' }));
        expect(onPublisherClick).toHaveBeenCalledWith(1);
    });

    it('shows series loading indicator when a publisher is selected and series are loading', () => {
        renderWithRouter(
            <PublisherList
                {...defaultProps}
                selectedPublisherId={1}
                seriesLoading={true}
            />
        );
        expect(screen.getByText(/loading series/i)).toBeInTheDocument();
    });

    it('shows series list with links when publisher is expanded', () => {
        renderWithRouter(
            <PublisherList
                {...defaultProps}
                selectedPublisherId={1}
                series={seriesList}
                seriesLoading={false}
            />
        );
        expect(screen.getByText(/Daredevil Vol\. 1 \(1964\)/)).toBeInTheDocument();
        expect(screen.getByText('12/380')).toBeInTheDocument();
    });

    it('shows no series message when expanded publisher has no series', () => {
        renderWithRouter(
            <PublisherList
                {...defaultProps}
                selectedPublisherId={1}
                series={[]}
                seriesLoading={false}
            />
        );
        expect(screen.getByText(/no series found/i)).toBeInTheDocument();
    });
});

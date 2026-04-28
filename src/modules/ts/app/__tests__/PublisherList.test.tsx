import React from 'react';
import { render, screen } from '@testing-library/react';
import PublisherList from '../PublisherList';
import { Publisher } from '../App';

const publishers: Publisher[] = [
    { id: 1, name: 'Marvel' },
    { id: 2, name: 'DC' },
    { id: 3, name: 'Image' },
];

describe('PublisherList', () => {
    it('shows loading message when loading', () => {
        render(<PublisherList publishers={[]} loading={true} error="" />);
        expect(screen.getByText(/loading publishers/i)).toBeInTheDocument();
    });

    it('shows error when error is provided', () => {
        render(<PublisherList publishers={[]} loading={false} error="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows empty message when no publishers', () => {
        render(<PublisherList publishers={[]} loading={false} error="" />);
        expect(screen.getByText(/no publishers found/i)).toBeInTheDocument();
    });

    it('renders publisher names', () => {
        render(<PublisherList publishers={publishers} loading={false} error="" />);
        expect(screen.getByText('Marvel')).toBeInTheDocument();
        expect(screen.getByText('DC')).toBeInTheDocument();
        expect(screen.getByText('Image')).toBeInTheDocument();
    });
});

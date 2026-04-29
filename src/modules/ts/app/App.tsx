import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SeriesGrid from './SeriesGrid';

export interface Publisher {
    id: number;
    name: string;
    series_count?: number;
}

export interface Series {
    id: number;
    name: string;
    volume: number | null;
    startYear: number | null;
    totalIssues: number;
    ownedCount: number;
}

export interface Issue {
    id: number;
    number: string;
    sort: number | null;
    cover_date: string | null;
    owned: boolean;
}

export interface SeriesType {
    id: number;
    name: string;
}

const App: React.FC = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/view/series/:id" element={<SeriesGrid />} />
        </Routes>
    </BrowserRouter>
);

export default App;

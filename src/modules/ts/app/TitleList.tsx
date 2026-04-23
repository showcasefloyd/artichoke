import React from 'react';
import { Title, SeriesResponse } from './App';

interface Props {
    titles: Title[];
    openTitleId: number | null;
    seriesData: SeriesResponse | null;
    onTitleClick: (id: number) => void;
    onSeriesClick: (id: number) => void;
}

const TitleList: React.FC<Props> = ({ titles, openTitleId, seriesData, onTitleClick, onSeriesClick }) => (
    <ul id="titles-list">
        {titles.map(title => (
            <li key={title.id}>
                <a href="#" onClick={e => { e.preventDefault(); onTitleClick(title.id); }}>
                    <span className={openTitleId === title.id ? 'bi bi-chevron-down' : 'bi bi-chevron-right'} />
                    {title.name}
                </a>

                {seriesData && seriesData.series_id === title.id && (
                    <ul id="series-list">
                        {seriesData.series.map(book => (
                            <li key={book.id}>
                                {book.id !== 0
                                    ? <a href="#" onClick={e => { e.preventDefault(); onSeriesClick(book.id); }}>{book.title}</a>
                                    : book.title
                                }
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        ))}
    </ul>
);

export default TitleList;

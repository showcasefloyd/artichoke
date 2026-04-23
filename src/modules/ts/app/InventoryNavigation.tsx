import * as React from 'react';

import './InventoryColumn.scss';

interface InventoryColumnProps {
    title: string;
};

// This is a placeholder for the inventory navigation column. It will eventually
// display the list of publishers, titles, and issues in the user's inventory.
const InventoryColumn: React.FC<InventoryColumnProps> = ({ title }) => {
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        if (title === 'Publishers') {
            fetch('/publishers').then(res => { if (!res.ok) throw new Error(`Failed to load ${title} (${res.status})`); return res.json(); })
                .then(json => {
                    setData(json.publishers ?? [])
                    setLoading(false);
                })
                .catch(err => console.error(`Error loading ${title}:`, err));
        } else {
            setLoading(true);
            setData([]);
        };
    }, [title]);

    return (
        <div className="col-3 inventory-column">
            <h3>{title}</h3>
            <ul className="list-group">
            {loading ? (
                <p>Loading</p>
            ) : (
                data.map((item: any, index: number) => (
                    <div key={index} className="inventory-item">
                        <li className="list-group-item">{item.name} {item.title_count ? `(${item.title_count} titles)` : ''}</li>
                    </div>
                ))
            )}
            </ul>
        </div>
    )
};

// This component is a placeholder for the inventory navigation column.
// Based on the Miller Columns, it will allow users to navigate their
// inventory by Publisher, then Title, and then Issue.

const InventoryNavigation: React.FC = () => (
    <>
        <InventoryColumn title="Publishers" />
        <InventoryColumn title="Titles" />
        <InventoryColumn title="Issues" />
    </>
)



export default InventoryNavigation;


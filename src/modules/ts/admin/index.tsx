import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../../sass/main.scss';
import AdminApp from './AdminApp';

const rootEl = document.getElementById('root');
if (rootEl) {
    ReactDOM.createRoot(rootEl).render(<AdminApp />);
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../../sass/main.scss';
import AdminApp from './AdminApp';
import ErrorBoundary from '../ErrorBoundary';

const rootEl = document.getElementById('root');
if (rootEl) {
    ReactDOM.createRoot(rootEl).render(
        <ErrorBoundary>
            <AdminApp />
        </ErrorBoundary>
    );
}

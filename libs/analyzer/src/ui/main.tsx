import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Application } from './application.component';
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}
createRoot(rootElement).render(
    <StrictMode>
        <Application />
    </StrictMode>
);
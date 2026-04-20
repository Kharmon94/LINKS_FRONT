import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { ErrorBoundary } from './app/components/error-boundary';
import './styles/index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Ignore SW registration errors; app still runs as normal SPA.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

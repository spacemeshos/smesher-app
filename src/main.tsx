import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Including service workers...
// TODO: Turn it on once API will use GET method!
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js').catch((error) => {
//     // eslint-disable-next-line no-console
//     console.error('Service Worker error:', error);
//   });
// }

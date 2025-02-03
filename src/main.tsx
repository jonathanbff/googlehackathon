import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';  // Import i18n configuration
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher.jsx';


// Render the main app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Render the language switcher
createRoot(document.getElementById('language-switcher-root')).render(
  <StrictMode>
    <LanguageSwitcher />
  </StrictMode>,
);

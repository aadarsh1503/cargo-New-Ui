import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher.jsx';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';


// Render the main app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: false,
        appendTo: 'head',
      }}
    >
      <App />
    </GoogleReCaptchaProvider>
  </StrictMode>,
);

// Render the language switcher
createRoot(document.getElementById('language-switcher-root')).render(
  <StrictMode>
    <LanguageSwitcher />
  </StrictMode>,
);

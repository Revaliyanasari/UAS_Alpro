import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Font disimpan bersama aplikasi agar tetap tampil saat offline.
// Hanya subset Latin (cukup untuk Bahasa Indonesia) agar cache offline tetap kecil.
import '@fontsource/nunito/latin-500.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';

import './styles/tokens.css';
import './styles/global.css';
import App from './App.jsx';
import UpdatePrompt from './pwa/UpdatePrompt.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UpdatePrompt />
      <App />
    </BrowserRouter>
  </StrictMode>,
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Import global styles
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Log app initialization
console.log('✅ FleetX ERP Application Initialized');
console.log('📱 Version:', window.publicConfig?.APP_VERSION || '2.0.0');

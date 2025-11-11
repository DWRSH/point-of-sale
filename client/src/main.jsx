// File: client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // 1. AuthProvider इम्पोर्ट करें

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. पूरे App को AuthProvider से wrap करें */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
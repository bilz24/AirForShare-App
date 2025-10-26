import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // 🚨 CRITICAL: Ensure this path is correct!
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* This must render your App component */}
  </React.StrictMode>,
);
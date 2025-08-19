import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import your main App component
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { HelmetProvider } from 'react-helmet-async';

// Create a root and render your App component into it
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter> {/* Wrap App with BrowserRouter */}
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

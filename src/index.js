import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import your main App component
import { BrowserRouter } from 'react-router-dom';


// Create a root and render your App component into it
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/aor">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // We'll create this file for global styles
import { Toaster } from "react-hot-toast";

// Find the root element in your HTML where the app will be mounted.
const rootElement = document.getElementById('root');

// Create a root for the React application.
const root = ReactDOM.createRoot(rootElement);

// Render the main App component inside React's StrictMode.
// StrictMode helps catch potential problems in an application.
root.render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>
);


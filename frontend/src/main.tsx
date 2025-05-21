import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import TestApp from './TestApp' // Import our test app

// Get URL parameters to check if we're in test mode
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.get('test') === 'true';

// Create root element and render application
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Render either the main app or test app based on URL parameter
createRoot(rootElement).render(
  <StrictMode>
    {isTestMode ? <TestApp /> : <App />}
  </StrictMode>,
)

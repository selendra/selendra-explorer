import React from 'react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import { Layout, ErrorBoundary } from './components';
import { About } from './pages';
import './App.css';
import { ThemeProvider, WalletProvider } from './content';

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<About />} />
    </Route>
  )
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WalletProvider>
          <React.Suspense fallback={<PageLoader />}>
            <RouterProvider router={router} />
          </React.Suspense>
        </WalletProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
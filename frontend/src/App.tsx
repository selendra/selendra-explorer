import React from 'react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";

import { Layout, ErrorBoundary } from './components';
import { ThemeProvider, WalletProvider } from './content';
import { Home, Search, Block } from './pages';
import './App.css';


// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="search" element={<Search />} />

        {/* EVM Routes */}
        <Route path="evm">
        <Route path="blocks/:blockId" element={<Block networkType="evm" />} />
        <Route path="transactions/:txHash" element={<div>EVM Transaction Details</div>} />
        <Route path="accounts/:address" element={<div>EVM Account Details</div>} />
        <Route path="contracts/:address" element={<div>EVM Contract Details</div>} />
      </Route>
      
      {/* Substrate Routes */}
      <Route path="substrate">
        <Route path="blocks/:blockId" element={<Block networkType="substrate" />} />
        <Route path="extrinsics/:hash" element={<div>Substrate Extrinsic Details</div>} />
        <Route path="accounts/:address" element={<div>Substrate Account Details</div>} />
      </Route>
      
      {/* Legacy/Generic Block Route - Auto-detect network */}
      <Route path="blocks/:blockId" element={<Block />} />
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
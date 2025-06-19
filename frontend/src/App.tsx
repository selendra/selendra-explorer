import * as React from "react";
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ApiProvider } from "./contexts/ApiContext";
import { WalletProvider } from "./contexts/WalletContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Layout
import Layout from "./components/layout/Layout";

// Pages
import Home from "./pages/Home";
import Blocks from "./pages/Blocks";
import BlockDetails from "./pages/BlockDetails";
import Transactions from "./pages/Transactions";
import TransactionDetails from "./pages/TransactionDetails";
import Accounts from "./pages/Accounts";
import AccountDetails from "./pages/AccountDetails";
import Contracts from "./pages/Contracts";
import ContractDetails from "./pages/ContractDetails";
import Tokens from "./pages/Tokens";
import TokenDetails from "./pages/TokenDetails";
import Validators from "./pages/Validators";
import ValidatorDetails from "./pages/ValidatorDetails";
// Use lazy loading for Staking component
const Staking = React.lazy(() => import("./pages/Staking"));
// Use lazy loading for Wallet component
const WalletPage = React.lazy(() => import("./pages/WalletPage"));
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Extrinsics from "./pages/Extrinsics";
import ExtrinsicDetails from "./pages/ExtrinsicDetails";
import Events from "./pages/Events";
import Identity from "./pages/Identity";
import Charts from "./pages/Charts";
import Api from "./pages/Api";
import VerifyContract from "./pages/VerifyContract";
import Favorites from "./pages/Favorites";

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
  </div>
);

// Define routes with Layout as parent and properly nested children
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="blocks" element={<Blocks />} />
      <Route path="blocks/:blockId" element={<BlockDetails />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="transactions/:txHash" element={<TransactionDetails />} />
      <Route path="accounts" element={<Accounts />} />
      <Route path="accounts/:address" element={<AccountDetails />} />
      <Route path="contracts" element={<Contracts />} />
      <Route path="contracts/:address" element={<ContractDetails />} />
      <Route path="tokens" element={<Tokens />} />
      <Route path="tokens/:address" element={<TokenDetails />} />
      <Route path="validators" element={<Validators />} />
      <Route path="validators/:address" element={<ValidatorDetails />} />
      <Route path="staking" element={
        <React.Suspense fallback={<PageLoader />}>
          <Staking />
        </React.Suspense>
      } />
      <Route path="wallet" element={
        <React.Suspense fallback={<PageLoader />}>
          <WalletPage />
        </React.Suspense>
      } />
      <Route path="extrinsics" element={<Extrinsics />} />
      <Route path="extrinsics/:blockNumber/:extrinsicIndex" element={<ExtrinsicDetails />} />
      <Route path="events" element={<Events />} />
      <Route path="charts" element={<Charts />} />
      <Route path="identity" element={<Identity />} />
      <Route path="api" element={<Api />} />
      <Route path="verify" element={<VerifyContract />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="search" element={<Search />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <ErrorBoundary>
      <ApiProvider>
        <ThemeProvider>
          <WalletProvider>
            <React.Suspense fallback={<PageLoader />}>
              <RouterProvider router={router} />
            </React.Suspense>
          </WalletProvider>
        </ThemeProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}

export default App;

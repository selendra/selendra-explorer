import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { ApiProvider } from "./contexts/ApiContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import MyAccount from "./pages/MyAccount";

// Lazy load other pages
const Blocks = lazy(() => import("./pages/Blocks"));
const BlockDetails = lazy(() => import("./pages/BlockDetails"));
const Transactions = lazy(() => import("./pages/Transactions"));
const TransactionDetails = lazy(() => import("./pages/TransactionDetails"));
const Accounts = lazy(() => import("./pages/Accounts"));
const AccountDetails = lazy(() => import("./pages/AccountDetails"));
const Contracts = lazy(() => import("./pages/Contracts"));
const ContractDetails = lazy(() => import("./pages/ContractDetails"));
const Extrinsics = lazy(() => import("./pages/Extrinsics"));
const ExtrinsicDetails = lazy(() => import("./pages/ExtrinsicDetails"));
const Tokens = lazy(() => import("./pages/Tokens"));
const TokenDetails = lazy(() => import("./pages/TokenDetails"));
const Validators = lazy(() => import("./pages/Validators"));
const ValidatorDetails = lazy(() => import("./pages/ValidatorDetails"));
const Search = lazy(() => import("./pages/Search"));
const MyAssets = lazy(() => import("./pages/MyAssets"));
const MyStaking = lazy(() => import("./pages/MyStaking"));
const MyContracts = lazy(() => import("./pages/MyContracts"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <Router>
      <ApiProvider>
        <WalletProvider>
          <Layout>
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-64">
                  Loading...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />

                {/* Block Routes */}
                <Route path="/blocks" element={<Blocks />} />
                <Route path="/blocks/:blockId" element={<BlockDetails />} />

                {/* Transaction Routes */}
                <Route path="/transactions" element={<Transactions />} />
                <Route
                  path="/transactions/:hash"
                  element={<TransactionDetails />}
                />

                {/* Account Routes */}
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/accounts/:address" element={<AccountDetails />} />

                {/* Contract Routes */}
                <Route path="/contracts" element={<Contracts />} />
                <Route
                  path="/contracts/:address"
                  element={<ContractDetails />}
                />

                {/* Extrinsic Routes */}
                <Route path="/extrinsics" element={<Extrinsics />} />
                <Route
                  path="/extrinsics/:hash"
                  element={<ExtrinsicDetails />}
                />

                {/* Token Routes */}
                <Route path="/tokens" element={<Tokens />} />
                <Route path="/tokens/:address" element={<TokenDetails />} />

                {/* Validator Routes */}
                <Route path="/validators" element={<Validators />} />
                <Route
                  path="/validators/:address"
                  element={<ValidatorDetails />}
                />

                {/* Search Route */}
                <Route path="/search" element={<Search />} />

                {/* Wallet Routes */}
                <Route path="/my-account" element={<MyAccount />} />
                <Route path="/my-assets" element={<MyAssets />} />
                <Route path="/my-staking" element={<MyStaking />} />
                <Route path="/my-contracts" element={<MyContracts />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </WalletProvider>
      </ApiProvider>
    </Router>
  );
}

export default App;

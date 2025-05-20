import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ApiProvider } from "./contexts/ApiContext";

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
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
  </div>
);

function App() {
  return (
    <ApiProvider>
      <ThemeProvider>
        <Router>
          <Layout>
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blocks" element={<Blocks />} />
                <Route path="/blocks/:blockId" element={<BlockDetails />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transactions/:txHash" element={<TransactionDetails />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/accounts/:address" element={<AccountDetails />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/contracts/:address" element={<ContractDetails />} />
                <Route path="/tokens" element={<Tokens />} />
                <Route path="/tokens/:address" element={<TokenDetails />} />
                <Route path="/validators" element={<Validators />} />
                <Route path="/validators/:address" element={<ValidatorDetails />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </Layout>
        </Router>
      </ThemeProvider>
    </ApiProvider>
  );
}

export default App;

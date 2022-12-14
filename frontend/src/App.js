import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HeaderComponent from './components/Header';
import Home from './pages/home';
import Accounts from './pages/accounts';
import AccountDetail from './pages/accounts/accountDetail';
import Blocks from './pages/blocks';
import BlockDetail from './pages/blocks/blockDetail';
import Events from './pages/events';
import Extrinsics from './pages/extrinsics';
import ExtrinsicDetail from './pages/extrinsics/extrinsicDetail';
import Transfers from './pages/transfers';
import TransferDetail from './pages/transfers/transferDetail';
import Staking from './pages/staking';
import ValidatorDetail from './pages/staking/validatorDetail';

function App() {
  return (
    <BrowserRouter>
      <HeaderComponent />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blocks" element={<Blocks />} />
        <Route path="/blocks/:id" element={<BlockDetail />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/transfers/:hash" element={<TransferDetail />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/extrinsics" element={<Extrinsics />} />
        <Route path="/extrinsics/:id" element={<ExtrinsicDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/staking" element={<Staking />} />
        <Route path="/validator/:id" element={<ValidatorDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState } from 'react';
import WalletProfile from '../components/profile/WalletProfile';
import AssetBridge from '../components/bridge/AssetBridge';

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'bridge'>('wallet');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar (on desktop) / Top tabs (on mobile) */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Wallet Menu</h2>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'wallet'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  My Wallet
                </button>
                <button
                  onClick={() => setActiveTab('bridge')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'bridge'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Bridge Assets
                </button>
              </nav>
            </div>
          </div>
          
          {/* Network Status */}
          <div className="mt-4 bg-slate-800 rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Supported Networks</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-slate-300">Selendra</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-slate-300">Ethereum</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-slate-300">Polygon</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-slate-300">Arbitrum</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1">
          {activeTab === 'wallet' && <WalletProfile />}
          {activeTab === 'bridge' && <AssetBridge />}
        </div>
      </div>
    </div>
  );
};

export default WalletPage; 
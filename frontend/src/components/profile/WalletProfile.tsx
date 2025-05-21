import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { truncateAddress } from '../../utils/formatting';

// Asset Type
type Asset = {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  change24h: string;
  icon: string;
  isNative?: boolean;
};

// Mock data - will be replaced with actual blockchain data
const mockAssets: Asset[] = [
  {
    symbol: 'SEL',
    name: 'Selendra',
    balance: '125.45',
    usdValue: '$250.90',
    change24h: '+2.4%',
    icon: '/tokens/sel.png',
    isNative: true, // SEL is a native token
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '0.12',
    usdValue: '$360.00',
    change24h: '-1.2%',
    icon: '/tokens/eth.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    balance: '500.00',
    usdValue: '$500.00',
    change24h: '0.0%',
    icon: '/tokens/usdt.png',
  },
];

// Network colors
const networkColors: Record<string, string> = {
  'Selendra': 'bg-pink-600',
  'Ethereum': 'bg-blue-600',
  'Polygon': 'bg-purple-600',
  'Arbitrum': 'bg-blue-800',
  'Sepolia': 'bg-orange-500',
};

const WalletProfile = () => {
  const { isConnected, address, networkName, connect, disconnect, activities, balance } = useWallet();
  const [activeTab, setActiveTab] = useState<'assets' | 'activity'>('assets');

  // Network color
  const networkColor = networkName && networkColors[networkName] ? 
    networkColors[networkName] : 'bg-slate-600';

  // Debug handler for wallet connection
  const handleConnectClick = () => {
    console.log('Connect button clicked in WalletProfile');
    connect();
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-slate-300 mb-6 text-center">
          Connect your wallet to view your assets, track activity, and manage your portfolio on various networks.
        </p>
        <button
          onClick={handleConnectClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      {/* Profile Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center mb-2">
              <h2 className="text-xl font-semibold text-white mr-2">
                My Wallet
              </h2>
              {networkName && (
                <span className={`px-2 py-1 text-xs font-medium text-white rounded-lg ${networkColor}`}>
                  {networkName}
                </span>
              )}
            </div>
            <div className="flex items-center mt-1">
              <span className="text-slate-300">{truncateAddress(address || '')}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(address || '')}
                className="ml-2 text-blue-400 hover:text-blue-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex">
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'assets'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab('assets')}
          >
            Assets
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'activity'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'assets' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Your Assets</h3>
              <button className="text-sm text-blue-400 hover:text-blue-300">
                Bridge Assets
              </button>
            </div>

            {/* Balance Display */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <div className="text-sm text-blue-200 mb-1">Total Balance</div>
              <div className="text-2xl font-bold text-white">{balance.value} {balance.symbol}</div>
            </div>

            <div className="space-y-4">
              {mockAssets.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={asset.icon}
                      alt={asset.name}
                      className="h-10 w-10 rounded-full mr-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/tokens/default.png';
                      }}
                    />
                    <div>
                      <div className="font-medium text-white">
                        {asset.name}
                        {asset.isNative && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Native</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">{asset.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">{asset.balance}</div>
                    <div className="text-sm text-slate-400">{asset.usdValue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
            
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 bg-slate-700 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-white capitalize">{activity.type}</div>
                          <div className="text-sm text-slate-400">
                            {new Date(activity.date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-white font-medium">
                        {activity.details.amount}
                      </div>
                    </div>
                    {activity.details.to && (
                      <div className="mt-2 text-sm text-slate-400">
                        To: {truncateAddress(String(activity.details.to))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No activity yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletProfile; 
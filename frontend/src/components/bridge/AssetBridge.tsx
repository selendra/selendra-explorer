import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';

// Supported chains for bridging
const SUPPORTED_CHAINS = [
  { id: 1961, name: 'Selendra', icon: '/chains/selendra.png', symbol: 'SEL' },
  { id: 1, name: 'Ethereum', icon: '/chains/ethereum.png', symbol: 'ETH' },
  { id: 137, name: 'Polygon', icon: '/chains/polygon.png', symbol: 'MATIC' },
  { id: 42161, name: 'Arbitrum', icon: '/chains/arbitrum.png', symbol: 'ETH' },
];

// Bridgeable assets
const BRIDGEABLE_ASSETS = [
  { symbol: 'SEL', name: 'Selendra', icon: '/tokens/sel.png', balance: '125.45' },
  { symbol: 'ETH', name: 'Ethereum', icon: '/tokens/eth.png', balance: '0.12' },
  { symbol: 'USDT', name: 'Tether', icon: '/tokens/usdt.png', balance: '500.00' },
];

const AssetBridge = () => {
  const { isConnected, connect, chainId } = useWallet();
  const [sourceChain, setSourceChain] = useState(chainId || 1961);
  const [destinationChain, setDestinationChain] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState(BRIDGEABLE_ASSETS[0]);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get current chain details
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === sourceChain);
  
  // Filter out current chain from destination options
  const destinationOptions = SUPPORTED_CHAINS.filter(chain => chain.id !== sourceChain);

  const handleSourceChainChange = (chainId: number) => {
    setSourceChain(chainId);
    // Reset destination if it matches new source
    if (destinationChain === chainId) {
      setDestinationChain(destinationOptions[0]?.id || 0);
    }
  };

  const handleBridge = async () => {
    if (!isConnected || !amount || parseFloat(amount) <= 0) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call blockchain methods to:
      // 1. Approve token spending (if ERC20)
      // 2. Call bridge contract
      // 3. Monitor transaction status
      
      console.log('Bridging', amount, selectedAsset.symbol, 'from', sourceChain, 'to', destinationChain);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setAmount('');
      
      // Success notification would show here
    } catch (error) {
      console.error('Bridge error:', error);
      // Error notification would show here
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to Bridge Assets</h2>
        <p className="text-slate-300 mb-6 text-center">
          Connect your wallet to transfer assets between Selendra and other chains.
        </p>
        <button
          onClick={connect}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-white">Bridge Assets</h2>
        <p className="text-slate-300 mt-1">
          Transfer your assets between Selendra and other supported chains
        </p>
      </div>

      <div className="p-6">
        {/* Source Chain Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">From Chain</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUPPORTED_CHAINS.map((chain) => (
              <button
                key={chain.id}
                className={`p-3 rounded-lg flex flex-col items-center justify-center border transition-colors ${
                  sourceChain === chain.id
                    ? 'border-blue-500 bg-slate-700'
                    : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                }`}
                onClick={() => handleSourceChainChange(chain.id)}
              >
                <img 
                  src={chain.icon} 
                  alt={chain.name} 
                  className="h-8 w-8 mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/chains/default.png';
                  }}
                />
                <span className="text-sm font-medium text-white">{chain.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Destination Chain Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">To Chain</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {destinationOptions.map((chain) => (
              <button
                key={chain.id}
                className={`p-3 rounded-lg flex flex-col items-center justify-center border transition-colors ${
                  destinationChain === chain.id
                    ? 'border-blue-500 bg-slate-700'
                    : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                }`}
                onClick={() => setDestinationChain(chain.id)}
              >
                <img 
                  src={chain.icon} 
                  alt={chain.name} 
                  className="h-8 w-8 mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/chains/default.png';
                  }}
                />
                <span className="text-sm font-medium text-white">{chain.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Asset Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Asset</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {BRIDGEABLE_ASSETS.map((asset) => (
              <button
                key={asset.symbol}
                className={`p-3 rounded-lg flex items-center justify-between border transition-colors ${
                  selectedAsset.symbol === asset.symbol
                    ? 'border-blue-500 bg-slate-700'
                    : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                }`}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex items-center">
                  <img 
                    src={asset.icon} 
                    alt={asset.name} 
                    className="h-8 w-8 mr-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/tokens/default.png';
                    }}
                  />
                  <span className="text-sm font-medium text-white">{asset.name}</span>
                </div>
                <span className="text-sm text-slate-300">{asset.balance}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-300">Amount</label>
            <button 
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={() => setAmount(selectedAsset.balance)}
            >
              Max: {selectedAsset.balance}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                // Only allow numbers and decimals
                const value = e.target.value.replace(/[^0-9.]/g, '');
                setAmount(value);
              }}
              className="w-full bg-slate-700 rounded-lg border border-slate-600 py-3 px-4 text-white"
              placeholder="0.0"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-300">
              {selectedAsset.symbol}
            </div>
          </div>
        </div>

        {/* Fee and Time Estimate */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300">Estimated Fee</span>
            <span className="text-sm text-white">~0.001 {currentChain?.symbol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-300">Estimated Time</span>
            <span className="text-sm text-white">~2-5 minutes</span>
          </div>
        </div>

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading || !amount || parseFloat(amount) <= 0
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'Processing...' : 'Bridge Assets'}
        </button>
      </div>
    </div>
  );
};

export default AssetBridge; 
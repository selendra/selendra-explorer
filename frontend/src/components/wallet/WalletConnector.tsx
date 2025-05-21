import { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';

/**
 * A simple component for testing wallet connection functionality
 */
const WalletConnector = () => {
  const { isConnected, address, networkName, connect, disconnect } = useWallet();
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleConnect = () => {
    setDebugInfo('Connect clicked at ' + new Date().toISOString());
    console.log('Connect button clicked in WalletConnector');
    connect();
  };

  const handleDisconnect = () => {
    setDebugInfo('Disconnect clicked at ' + new Date().toISOString());
    console.log('Disconnect button clicked in WalletConnector');
    disconnect();
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-slate-800 rounded-lg shadow-lg z-40">
      <div className="mb-2 text-sm text-slate-300">Wallet Connector (Debug)</div>
      
      {isConnected ? (
        <div>
          <div className="text-xs text-white mb-2">
            <div>Address: {address}</div>
            <div>Network: {networkName}</div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
        >
          Connect Wallet
        </button>
      )}
      
      {debugInfo && (
        <div className="mt-2 text-xs text-slate-400">
          {debugInfo}
        </div>
      )}
    </div>
  );
};

export default WalletConnector; 
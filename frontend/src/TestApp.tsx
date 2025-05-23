import React, { useState } from 'react';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import ErrorBoundary from './components/ErrorBoundary';

// Separate component for wallet connection button
const WalletConnectButton: React.FC = () => {
  const { connect, isConnected, address, networkName, disconnect } = useWallet();

  const handleConnectClick = () => {
    console.log('Connect button clicked in TestApp');
    connect();
  };

  if (isConnected) {
    return (
      <div className="w-full text-center">
        <div className="mb-2 text-sm text-slate-300">
          Connected to <span className="font-medium text-white">{networkName}</span>
        </div>
        <div className="mb-4 text-white">{address}</div>
        <button
          onClick={disconnect}
          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnectClick}
      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  );
};

// Main test app content that uses the wallet context
const TestAppContent: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-8">Wallet Connection Test</h1>
      
      <button
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-8"
        onClick={() => {
          console.log('Showing wallet modal...');
          setShowModal(true);
        }}
      >
        Show Modal Directly
      </button>
      
      <div className="p-8 bg-slate-800 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-slate-300 mb-6">
          Connect your wallet to view your assets, track activity, and manage your portfolio on various networks.
        </p>
        <WalletConnectButton />
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md p-6 mx-4 bg-slate-800 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Test Modal</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-white">This is a test modal to verify that modals can appear correctly.</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App component that provides the wallet context
const TestApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <TestAppContent />
      </WalletProvider>
    </ErrorBoundary>
  );
};

export default TestApp; 
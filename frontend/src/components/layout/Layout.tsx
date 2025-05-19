import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isConnected, address, balance, connect, disconnect } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
  };

  const handleConnectEVM = async () => {
    await connect('evm');
    setIsWalletModalOpen(false);
  };

  const handleConnectSubstrate = async () => {
    await connect('substrate');
    setIsWalletModalOpen(false);
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blocks', path: '/blocks' },
    { name: 'Transactions', path: '/transactions' },
    { name: 'Extrinsics', path: '/extrinsics' },
    { name: 'Contracts', path: '/contracts' },
    { name: 'Tokens', path: '/tokens' },
    { name: 'Validators', path: '/validators' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">Selendra Explorer</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium ${
                    location.pathname === link.path
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Link to="/search" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Wallet Button */}
              {isConnected ? (
                <div className="relative">
                  <button
                    onClick={toggleWalletModal}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full px-4 py-2 text-sm font-medium"
                  >
                    <span>{formatAddress(address)}</span>
                    <span className="text-green-500">{balance ? `${parseFloat(balance).toFixed(4)} SEL` : ''}</span>
                  </button>

                  {/* Wallet Dropdown */}
                  {isWalletModalOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <Link
                          to="/my-account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setIsWalletModalOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          to="/my-assets"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setIsWalletModalOpen(false)}
                        >
                          My Assets
                        </Link>
                        <Link
                          to="/my-staking"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setIsWalletModalOpen(false)}
                        >
                          My Staking
                        </Link>
                        <Link
                          to="/my-contracts"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => setIsWalletModalOpen(false)}
                        >
                          My Contracts
                        </Link>
                        <button
                          onClick={handleDisconnect}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={toggleWalletModal}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-md px-4 py-2 text-sm font-medium"
                >
                  Connect Wallet
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="md:hidden text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2 px-4 rounded-md ${
                    location.pathname === link.path
                      ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Wallet Connection Modal */}
      {isWalletModalOpen && !isConnected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your wallet to access additional features like asset management, staking, and contract interaction.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleConnectEVM}
                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md px-4 py-3"
              >
                <span className="font-medium">MetaMask (EVM)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={handleConnectSubstrate}
                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md px-4 py-3"
              >
                <span className="font-medium">Polkadot.js (Substrate)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button
              onClick={toggleWalletModal}
              className="mt-4 w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Selendra Explorer. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://selendra.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                Website
              </a>
              <a
                href="https://docs.selendra.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                Documentation
              </a>
              <a
                href="https://github.com/selendra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

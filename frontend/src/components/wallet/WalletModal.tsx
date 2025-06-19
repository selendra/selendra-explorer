import { useState, useEffect } from 'react';
import { handleChainImageError } from '../../utils/imageUtils';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface NetworkOption {
  id: number;
  name: string;
  icon: string;
  symbol: string;
  isTestnet?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/wallets/metamask.svg',
    description: 'Connect to your MetaMask wallet'
  },
  {
    id: 'polkadotjs',
    name: 'Polkadot.js',
    icon: '/wallets/polkadot.svg',
    description: 'Connect to your Polkadot.js wallet'
  },
  {
    id: 'talisman',
    name: 'Talisman',
    icon: '/wallets/talisman.svg',
    description: 'Connect with your Talisman wallet'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.svg',
    description: 'Connect with WalletConnect'
  }
];

const networkOptions: NetworkOption[] = [
  {
    id: 1961,
    name: 'Selendra',
    icon: '/chains/selendra.png',
    symbol: 'SEL'
  },
  {
    id: 1,
    name: 'Ethereum',
    icon: '/chains/ethereum.png',
    symbol: 'ETH'
  },
  {
    id: 137,
    name: 'Polygon',
    icon: '/chains/polygon.png',
    symbol: 'MATIC'
  },
  {
    id: 42161,
    name: 'Arbitrum',
    icon: '/chains/arbitrum.png',
    symbol: 'ETH'
  },
  {
    id: 11155111,
    name: 'Sepolia',
    icon: '/chains/ethereum.png',
    symbol: 'ETH',
    isTestnet: true
  }
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletId: string, networkId: number) => void;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'network' | 'wallet'>('network');
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null);

  // For debugging
  useEffect(() => {
    console.log('WalletModal rendered, isOpen:', isOpen);
  }, [isOpen]);

  // Handle pressing ESC to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Handle outside click
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target?.id === 'wallet-modal-backdrop') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  // Fix hydration issues with SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('network');
      setSelectedNetwork(null);
    }
  }, [isOpen]);
  
  if (!mounted) return null;
  
  // Handle network selection
  const handleNetworkSelect = (networkId: number) => {
    console.log('Network selected:', networkId);
    setSelectedNetwork(networkId);
    setStep('wallet');
  };

  // Handle wallet connection
  const handleWalletConnect = (walletId: string) => {
    console.log('Wallet selected:', walletId);
    if (selectedNetwork) {
      onConnect(walletId, selectedNetwork);
    }
  };

  // Step back to network selection
  const goBack = () => {
    setStep('network');
  };
  
  return (
    <div 
      id="wallet-modal-backdrop" 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="relative w-full max-w-md p-6 mx-4 bg-slate-800 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {step === 'network' ? 'Select Network' : 'Connect Wallet'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {step === 'network' ? (
          <>
            <p className="text-slate-300 mb-6">
              Select which network you want to connect to
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {networkOptions.map((network) => (
                <button
                  key={network.id}
                  className="flex flex-col items-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  onClick={() => handleNetworkSelect(network.id)}
                  type="button"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center mb-2">
                    <img 
                      src={network.icon} 
                      alt={network.name} 
                      className="h-8 w-8"
                      onError={handleChainImageError}
                    />
                  </div>
                  <p className="font-medium text-white text-sm">{network.name}</p>
                  {network.isTestnet && (
                    <span className="mt-1 px-2 py-0.5 bg-amber-500 text-xs rounded-full">Testnet</span>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <button 
                onClick={goBack}
                className="mr-2 p-1 rounded-full hover:bg-slate-700"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <p className="text-slate-300">
                Choose a wallet to connect to{' '}
                <span className="font-medium text-white">
                  {networkOptions.find(n => n.id === selectedNetwork)?.name}
                </span>
              </p>
            </div>
            
            <div className="space-y-3">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.id}
                  className="w-full flex items-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  onClick={() => handleWalletConnect(wallet.id)}
                  type="button"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center mr-4">
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name} 
                      className="h-6 w-6"
                      onError={(e) => {
                        // Fallback icon if image is not found
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="2" y="4" width="20" height="16" rx="2"%3e%3c/rect%3e%3cpath d="M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"%3e%3c/path%3e%3c/svg%3e';
                      }}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">{wallet.name}</p>
                    <p className="text-sm text-slate-400">{wallet.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        
        <div className="mt-6 text-center text-sm text-slate-400">
          By connecting, you agree to the Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
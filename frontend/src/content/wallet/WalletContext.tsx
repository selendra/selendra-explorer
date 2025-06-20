import { WalletModal } from '../../components';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define types for wallet context
type WalletContextType = {
  isConnected: boolean;
  address: string | undefined;
  chainId: number | undefined;
  networkName: string | undefined;
  connect: () => void;
  disconnect: () => void;
  balance: {
    symbol: string;
    value: string;
  };
  activities: Array<{
    id: string;
    type: string;
    date: Date;
    details: Record<string, string | number>;
  }>;
  isModalOpen: boolean;
};

// Activity type
interface Activity {
  id: string;
  type: string;
  date: Date;
  details: Record<string, string | number>;
}

// Network information
interface NetworkInfo {
  id: number;
  name: string;
  symbol: string;
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Network configurations
const NETWORKS: Record<number, NetworkInfo> = {
  1961: { id: 1961, name: 'Selendra', symbol: 'SEL' },
  1: { id: 1, name: 'Ethereum', symbol: 'ETH' },
  137: { id: 137, name: 'Polygon', symbol: 'MATIC' },
  42161: { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
  11155111: { id: 11155111, name: 'Sepolia', symbol: 'ETH' }
};

// Context provider
export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>();
  const [chainId, setChainId] = useState<number>();
  const [showModal, setShowModal] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [balance, setBalance] = useState<{ symbol: string; value: string }>({ symbol: '', value: '0' });

  // Get network name based on chain ID
  const networkName = chainId ? NETWORKS[chainId]?.name : undefined;

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', showModal);
  }, [showModal]);

  // Connect wallet
  const connect = () => {
    console.log('Connect wallet clicked, opening modal');
    setShowModal(true);
  };

  // Handle wallet connection from modal
  const handleConnect = (walletId: string, networkId: number) => {
    console.log(`Connecting to ${walletId} on network ${networkId}...`);
    
    // Get network info
    const network = NETWORKS[networkId];
    if (!network) {
      console.error(`Network ${networkId} not supported`);
      return;
    }
    
    setIsConnected(true);
    setChainId(networkId);
    setShowModal(false);
    
    // In real implementation, this would connect to the actual wallet on the specified network
  };

  // Disconnect wallet
  const disconnect = () => {
    setIsConnected(false);
    setAddress(undefined);
    setChainId(undefined);
    setActivities([]);
    setBalance({ symbol: '', value: '0' });
  };

  const value = {
    isConnected,
    address,
    chainId,
    networkName,
    connect,
    disconnect,
    balance,
    activities,
    isModalOpen: showModal
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletModal 
        isOpen={showModal}
        onClose={() => {
          console.log('Modal closing');
          setShowModal(false);
        }}
        onConnect={handleConnect}
      />
    </WalletContext.Provider>
  );
}

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 
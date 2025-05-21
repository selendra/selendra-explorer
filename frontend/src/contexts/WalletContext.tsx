import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import WalletModal from '../components/wallet/WalletModal';

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

// Mock addresses for different networks
const MOCK_ADDRESSES: Record<number, string> = {
  1961: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  1: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
  137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  42161: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
  11155111: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
};

// Mock balances for different networks
const MOCK_BALANCES: Record<number, { symbol: string; value: string }> = {
  1961: { symbol: 'SEL', value: '0.56' },
  1: { symbol: 'ETH', value: '1.23' },
  137: { symbol: 'MATIC', value: '432.1' },
  42161: { symbol: 'ETH', value: '0.45' },
  11155111: { symbol: 'ETH', value: '10.0' }
};

// Mock activities for demonstration
const MOCK_ACTIVITIES: Record<number, Activity[]> = {
  1961: [
    {
      id: '1',
      type: 'transfer',
      date: new Date(),
      details: { to: '0x123...', amount: '5 SEL' }
    },
    {
      id: '2',
      type: 'deposit',
      date: new Date(Date.now() - 86400000), // 1 day ago
      details: { from: '0xabc...', amount: '10 SEL' }
    }
  ],
  1: [
    {
      id: '1',
      type: 'swap',
      date: new Date(),
      details: { from: 'ETH', to: 'USDT', amount: '0.5 ETH → 800 USDT' }
    },
    {
      id: '2',
      type: 'mint',
      date: new Date(Date.now() - 86400000),
      details: { contract: '0xbca...', amount: '1 NFT' }
    }
  ],
  137: [
    {
      id: '1', 
      type: 'transfer',
      date: new Date(),
      details: { to: '0xdef...', amount: '100 MATIC' }
    }
  ],
  42161: [
    {
      id: '1',
      type: 'stake',
      date: new Date(),
      details: { pool: 'ETH-USDC', amount: '0.1 ETH' }
    }
  ],
  11155111: [
    {
      id: '1',
      type: 'test',
      date: new Date(),
      details: { to: '0xfff...', amount: '1 ETH' }
    }
  ]
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
    
    // Simulate connection with mock data
    setIsConnected(true);
    setChainId(networkId);
    setAddress(MOCK_ADDRESSES[networkId]);
    setBalance(MOCK_BALANCES[networkId]);
    setActivities(MOCK_ACTIVITIES[networkId] || []);
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
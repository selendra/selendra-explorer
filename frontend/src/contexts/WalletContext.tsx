import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import axios from 'axios';

// Define types
export type WalletType = 'evm' | 'substrate';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  walletType: WalletType | null;
  balance: string | null;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  assets: any[] | null;
  stakings: any[] | null;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [assets, setAssets] = useState<any[] | null>(null);
  const [stakings, setStakings] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [evmProvider, setEvmProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [substrateApi, setSubstrateApi] = useState<ApiPromise | null>(null);
  const [substrateAccounts, setSubstrateAccounts] = useState<InjectedAccountWithMeta[]>([]);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('wallet_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setSessionToken(session.token);
        setAddress(session.address);
        setWalletType(session.type);
        setIsConnected(true);
        
        // Fetch wallet data
        fetchWalletData(session.token);
      } catch (err) {
        console.error('Failed to parse stored session:', err);
        localStorage.removeItem('wallet_session');
      }
    }
  }, []);

  // Initialize Substrate API
  useEffect(() => {
    const initSubstrateApi = async () => {
      if (walletType === 'substrate' && !substrateApi) {
        try {
          const provider = new WsProvider('wss://rpc.selendra.org');
          const api = await ApiPromise.create({ provider });
          setSubstrateApi(api);
        } catch (err) {
          console.error('Failed to connect to Selendra node:', err);
          setError('Failed to connect to Selendra node');
        }
      }
    };

    initSubstrateApi();
  }, [walletType, substrateApi]);

  // Fetch wallet data from API
  const fetchWalletData = async (token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch assets
      const assetsResponse = await axios.get('/api/wallet/assets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssets(assetsResponse.data.assets);
      
      // Fetch stakings
      const stakingsResponse = await axios.get('/api/wallet/staking', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStakings(stakingsResponse.data.stakings);
      
      // Set balance from native asset
      const nativeAsset = assetsResponse.data.assets.find((asset: any) => asset.asset_type === 'native');
      if (nativeAsset) {
        setBalance(nativeAsset.balance);
      }
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      setError('Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect wallet
  const connect = async (type: WalletType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (type === 'evm') {
        // Connect to EVM wallet (MetaMask)
        if (!window.ethereum) {
          throw new Error('MetaMask not installed');
        }
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        // Sign message for authentication
        const message = `Connect to Selendra Explorer: ${Date.now()}`;
        const signature = await signer.signMessage(message);
        
        // Authenticate with backend
        const response = await axios.post('/api/wallet/connect', {
          address,
          wallet_type: 'evm',
          signature,
          message
        });
        
        // Save session
        setSessionToken(response.data.session_token);
        setAddress(address);
        setWalletType('evm');
        setIsConnected(true);
        setEvmProvider(provider);
        
        // Save to localStorage
        localStorage.setItem('wallet_session', JSON.stringify({
          token: response.data.session_token,
          address,
          type: 'evm'
        }));
        
        // Fetch wallet data
        fetchWalletData(response.data.session_token);
      } else if (type === 'substrate') {
        // Connect to Substrate wallet (Polkadot.js)
        const extensions = await web3Enable('Selendra Explorer');
        if (extensions.length === 0) {
          throw new Error('Polkadot.js extension not installed');
        }
        
        const accounts = await web3Accounts();
        if (accounts.length === 0) {
          throw new Error('No accounts found in Polkadot.js extension');
        }
        
        setSubstrateAccounts(accounts);
        
        // For simplicity, use the first account
        const account = accounts[0];
        const address = account.address;
        
        // Sign message for authentication
        const message = `Connect to Selendra Explorer: ${Date.now()}`;
        const signature = await account.signer.signRaw({
          address,
          data: message,
          type: 'bytes'
        });
        
        // Authenticate with backend
        const response = await axios.post('/api/wallet/connect', {
          address,
          wallet_type: 'substrate',
          signature: signature.signature,
          message
        });
        
        // Save session
        setSessionToken(response.data.session_token);
        setAddress(address);
        setWalletType('substrate');
        setIsConnected(true);
        
        // Save to localStorage
        localStorage.setItem('wallet_session', JSON.stringify({
          token: response.data.session_token,
          address,
          type: 'substrate'
        }));
        
        // Fetch wallet data
        fetchWalletData(response.data.session_token);
      }
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    if (sessionToken) {
      try {
        await axios.post('/api/wallet/disconnect', {}, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
      } catch (err) {
        console.error('Failed to disconnect from server:', err);
      }
    }
    
    setIsConnected(false);
    setAddress(null);
    setWalletType(null);
    setBalance(null);
    setAssets(null);
    setStakings(null);
    setSessionToken(null);
    setEvmProvider(null);
    
    localStorage.removeItem('wallet_session');
  };

  // Sign message
  const signMessage = async (message: string): Promise<string | null> => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }
    
    try {
      if (walletType === 'evm' && evmProvider) {
        const signer = evmProvider.getSigner();
        return await signer.signMessage(message);
      } else if (walletType === 'substrate' && substrateAccounts.length > 0) {
        const account = substrateAccounts.find(acc => acc.address === address);
        if (!account) {
          throw new Error('Account not found');
        }
        
        const signature = await account.signer.signRaw({
          address,
          data: message,
          type: 'bytes'
        });
        
        return signature.signature;
      }
      
      throw new Error('Unsupported wallet type');
    } catch (err: any) {
      console.error('Failed to sign message:', err);
      setError(err.message || 'Failed to sign message');
      return null;
    }
  };

  const value = {
    isConnected,
    address,
    walletType,
    balance,
    connect,
    disconnect,
    signMessage,
    assets,
    stakings,
    isLoading,
    error
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

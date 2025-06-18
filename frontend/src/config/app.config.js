export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Blockchain Explorer',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'A blockchain data explorer for EVM and Substrate networks',
  author: 'Your Name',
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    websocketUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws',
  },
  
  // Blockchain Configuration
  blockchain: {
    evm: {
      name: import.meta.env.VITE_EVM_NETWORK_NAME || 'Selendra Network',
      explorer: import.meta.env.VITE_EVM_EXPLORER_URL || 'https://rpcx.selendra.org',
      currency: import.meta.env.VITE_EVM_CURRENCY || 'SEL',
      decimals: parseInt(import.meta.env.VITE_EVM_DECIMALS) || 18,
    },
    substrate: {
      name: import.meta.env.VITE_SUBSTRATE_NETWORK_NAME || 'Substrate Network',
      explorer: import.meta.env.VITE_SUBSTRATE_EXPLORER_URL || 'https://polkadot.js.org/apps',
      currency: import.meta.env.VITE_SUBSTRATE_CURRENCY || 'DOT',
      decimals: parseInt(import.meta.env.VITE_SUBSTRATE_DECIMALS) || 10,
    },
  },
  
  // App Settings
  settings: {
    theme: 'dark', // Better for blockchain data
    language: 'en',
    itemsPerPage: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
    maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
    refreshInterval: parseInt(import.meta.env.VITE_BLOCK_REFRESH_INTERVAL) || 12000,
    maxRetries: 3,
  },
  
  // Feature Flags
  features: {
    darkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
    notifications: true,
    realTimeUpdates: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
    crossChainTracking: true,
    addressConversion: true,
    contractVerification: true,
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  
  // Data refresh intervals (in milliseconds)
  refreshIntervals: {
    network: parseInt(import.meta.env.VITE_NETWORK_REFRESH_INTERVAL) || 60000,
    latestBlock: parseInt(import.meta.env.VITE_BLOCK_REFRESH_INTERVAL) || 6000,
    transactions: parseInt(import.meta.env.VITE_TRANSACTION_REFRESH_INTERVAL) || 10000,
    accounts: parseInt(import.meta.env.VITE_ACCOUNT_REFRESH_INTERVAL) || 30000,
    events: parseInt(import.meta.env.VITE_EVENT_REFRESH_INTERVAL) || 15000,
  }
};
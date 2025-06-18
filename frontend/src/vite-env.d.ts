/// <reference types="vite/client" />

interface ImportMetaEnv {
    // App Configuration
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_APP_DESCRIPTION: string;
  
    // API Configuration
    readonly VITE_API_BASE_URL: string;
    readonly VITE_WS_URL: string;
    readonly VITE_API_TIMEOUT: string;
  
    // Feature Flags
    readonly VITE_ENABLE_DARK_MODE: string;
    readonly VITE_ENABLE_REAL_TIME: string;
    readonly VITE_ENABLE_ANALYTICS: string;
  
    // Blockchain Configuration
    readonly VITE_EVM_NETWORK_NAME: string;
    readonly VITE_EVM_CURRENCY: string;
    readonly VITE_EVM_DECIMALS: string;
    readonly VITE_EVM_EXPLORER_URL: string;
  
    readonly VITE_SUBSTRATE_NETWORK_NAME: string;
    readonly VITE_SUBSTRATE_CURRENCY: string;
    readonly VITE_SUBSTRATE_DECIMALS: string;
    readonly VITE_SUBSTRATE_EXPLORER_URL: string;
  
    // Refresh Intervals
    readonly VITE_NETWORK_REFRESH_INTERVAL: string;
    readonly VITE_BLOCK_REFRESH_INTERVAL: string;
    readonly VITE_TRANSACTION_REFRESH_INTERVAL: string;
    readonly VITE_ACCOUNT_REFRESH_INTERVAL: string;
    readonly VITE_EVENT_REFRESH_INTERVAL: string;
  
    // Pagination
    readonly VITE_DEFAULT_PAGE_SIZE: string;
    readonly VITE_MAX_PAGE_SIZE: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
export interface AppConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  api: ApiConfig;
  blockchain: BlockchainConfig;
  settings: AppSettings;
  features: FeatureFlags;
  refreshIntervals: RefreshIntervals;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  websocketUrl: string;
}

export interface BlockchainConfig {
  evm: NetworkConfig;
  substrate: NetworkConfig;
}

export interface NetworkConfig {
  name: string;
  explorer: string;
  currency: string;
  decimals: number;
}

export interface AppSettings {
  theme: string;
  language: string;
  itemsPerPage: number;
  maxPageSize: number;
  refreshInterval: number;
  maxRetries: number;
}

export interface FeatureFlags {
  darkMode: boolean;
  notifications: boolean;
  realTimeUpdates: boolean;
  crossChainTracking: boolean;
  addressConversion: boolean;
  contractVerification: boolean;
  analytics: boolean;
}

export interface RefreshIntervals {
  network: number;
  latestBlock: number;
  transactions: number;
  accounts: number;
  events: number;
}

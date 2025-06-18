import { NavItem, AddressType, ContractType, TransactionStatus, TransactionType } from ".";

export interface SiteConstants {
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  NAV_ITEMS: NavItem[];
  BLOCKCHAIN: BlockchainConstants;
  MESSAGES: Messages;
  STATUS: StatusTypes;
  FORMAT: FormatConfig;
}

export interface BlockchainConstants {
  TRANSACTION_STATUSES: Record<string, TransactionStatus>;
  TRANSACTION_TYPES: Record<string, TransactionType>;
  ADDRESS_TYPES: Record<string, AddressType>;
  CONTRACT_TYPES: Record<string, ContractType>;
}

export interface Messages {
  LOADING: string;
  ERROR: string;
  NO_DATA: string;
  SUCCESS: string;
  NETWORK_ERROR: string;
  TIMEOUT_ERROR: string;
  INVALID_ADDRESS: string;
  INVALID_HASH: string;
  BLOCK_NOT_FOUND: string;
  TRANSACTION_NOT_FOUND: string;
  CONTRACT_NOT_VERIFIED: string;
}

export interface StatusTypes {
  IDLE: string;
  LOADING: string;
  SUCCESS: string;
  ERROR: string;
  REFETCHING: string;
}

export interface FormatConfig {
  CURRENCY_DECIMALS: number;
  HASH_DISPLAY_LENGTH: number;
  ADDRESS_DISPLAY_LENGTH: number;
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;
}

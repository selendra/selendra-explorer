import { NetworkType } from './common';

export enum AccountType {
  EOA = 'eoa',
  Contract = 'contract',
}

export interface TokenBalance {
  token_address: string;
  token_name: string;
  token_symbol: string;
  balance: string;
  decimals: number;
}

export interface Identity {
  id: string;
  name: string;
  web?: string;
  email?: string;
  social_media?: string;
  sel_domain?: string; // For .sel domain
}

export interface Account {
  id: string;
  address: string;
  balance: string;
  transaferable: string;
  nonce: number;
  account_type: AccountType;
  created_at: string;
  transaction_count: number;
  network_type: NetworkType;
  tokens?: TokenBalance[];
  last_activity?: string;
  identity?: Identity;
} 
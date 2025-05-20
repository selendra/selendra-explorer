import type { SearchResult } from '../types';
import { mockBlocks } from './blocks';
import { mockTransactions } from './transactions';
import { mockAccounts } from './accounts';
import { mockContracts } from './contracts';
import { mockTokens } from './tokens';
import { mockValidators } from './validators';

// Search across all entities
export const searchMockData = (query: string): SearchResult[] => {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Search blocks
  const blockResults = mockBlocks
    .filter(block => 
      block.number.toString().includes(lowerQuery) || 
      block.hash.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 3)
    .map(block => ({
      type: 'block' as const,
      id: block.id,
      title: `Block #${block.number}`,
      subtitle: `Hash: ${block.hash.substring(0, 10)}...`,
      networkType: block.networkType,
    }));
  
  results.push(...blockResults);
  
  // Search transactions
  const txResults = mockTransactions
    .filter(tx => 
      tx.hash.toLowerCase().includes(lowerQuery) || 
      tx.from.toLowerCase().includes(lowerQuery) || 
      (tx.to && tx.to.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 3)
    .map(tx => ({
      type: 'transaction' as const,
      id: tx.id,
      title: `Transaction ${tx.hash.substring(0, 10)}...`,
      subtitle: `From: ${tx.from.substring(0, 10)}... To: ${tx.to ? tx.to.substring(0, 10) + '...' : 'Contract Creation'}`,
      networkType: tx.networkType,
    }));
  
  results.push(...txResults);
  
  // Search accounts
  const accountResults = mockAccounts
    .filter(account => 
      account.address.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 3)
    .map(account => ({
      type: 'account' as const,
      id: account.id,
      title: `Account ${account.address.substring(0, 10)}...`,
      subtitle: `Balance: ${account.balance} SEL`,
      networkType: account.networkType,
    }));
  
  results.push(...accountResults);
  
  // Search contracts
  const contractResults = mockContracts
    .filter(contract => 
      contract.address.toLowerCase().includes(lowerQuery) || 
      (contract.name && contract.name.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 3)
    .map(contract => ({
      type: 'contract' as const,
      id: contract.id,
      title: contract.name || `Contract ${contract.address.substring(0, 10)}...`,
      subtitle: `Address: ${contract.address.substring(0, 10)}...`,
      networkType: contract.networkType,
    }));
  
  results.push(...contractResults);
  
  // Search tokens
  const tokenResults = mockTokens
    .filter(token => 
      token.address.toLowerCase().includes(lowerQuery) || 
      token.name.toLowerCase().includes(lowerQuery) || 
      token.symbol.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 3)
    .map(token => ({
      type: 'token' as const,
      id: token.id,
      title: `${token.name} (${token.symbol})`,
      subtitle: `Address: ${token.address.substring(0, 10)}...`,
      networkType: token.networkType,
    }));
  
  results.push(...tokenResults);
  
  // Search validators
  const validatorResults = mockValidators
    .filter(validator => 
      validator.address.toLowerCase().includes(lowerQuery) || 
      (validator.name && validator.name.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 3)
    .map(validator => ({
      type: 'validator' as const,
      id: validator.id,
      title: validator.name || `Validator ${validator.address.substring(0, 10)}...`,
      subtitle: `Stake: ${validator.totalStake} SEL`,
      networkType: 'wasm' as const,
    }));
  
  results.push(...validatorResults);
  
  return results;
};

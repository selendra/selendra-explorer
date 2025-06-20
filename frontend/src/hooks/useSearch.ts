import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { apiService } from '../services';
import { 
  isValidEvmAddress, 
  isValidSs58Address, 
  isValidHash, 
  isValidBlockNumber 
} from '../utils';
import { 
  EvmBlock, 
  EvmTransaction, 
  EvmAccount, 
  EvmContract,
  SubstrateBlock,
  SubstrateExtrinsic 
} from '../types';

export type SearchType = 
  | 'block_number' 
  | 'transaction_hash' 
  | 'evm_account_address' 
  | 'ss58_account_address'
  | 'contract_address'
  | 'substrate_block_number'
  | 'substrate_block_hash'
  | 'substrate_extrinsic_hash' // NEW: Added this type
  | 'unknown';

export type SearchResult = 
  | { type: 'evm_block'; data: EvmBlock }
  | { type: 'substrate_block'; data: SubstrateBlock }
  | { type: 'evm_transaction'; data: EvmTransaction }
  | { type: 'substrate_extrinsic'; data: SubstrateExtrinsic } // NEW: Added this type
  | { type: 'evm_account'; data: EvmAccount }
  | { type: 'evm_contract'; data: EvmContract }
  | { type: 'ss58_address'; data: EvmAccount }
  | null;

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  searchType: SearchType;
  result: SearchResult;
  loading: boolean;
  error: string | null;
  search: (searchQuery?: string) => Promise<SearchResult>;
  clear: () => void;
  detectSearchType: (input: string) => SearchType;
}

export const useSearch = (): UseSearchReturn => {
  const [query, setQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<SearchType>('unknown');
  const [result, setResult] = useState<SearchResult>(null);

  // Individual API hooks for different search types
  const evmBlockByNumberApi = useApi(
    (blockNumber: number) => apiService.getEvmBlockByNumber(blockNumber),
    {},
    { immediate: false }
  );

  const evmBlockByHashApi = useApi(
    (blockHash: string) => apiService.getEvmBlockByHash(blockHash),
    {},
    { immediate: false }
  );

  const substrateBlockByNumberApi = useApi(
    (blockNumber: number) => apiService.getSubstrateBlockByNumber(blockNumber),
    {},
    { immediate: false }
  );

  const substrateBlockByHashApi = useApi(
    (blockHash: string) => apiService.getSubstrateBlockByHash(blockHash),
    {},
    { immediate: false }
  );

  const evmTransactionApi = useApi(
    (txHash: string) => apiService.getEvmTransactionByHash(txHash),
    {},
    { immediate: false }
  );

  // NEW: Add substrate extrinsic by hash API hook
  const substrateExtrinsicApi = useApi(
    (extrinsicHash: string) => apiService.getSubstrateExtrinsicByHash(extrinsicHash),
    {},
    { immediate: false }
  );

  const evmAccountApi = useApi(
    (address: string) => apiService.getEvmAccountByAddress(address),
    {},
    { immediate: false }
  );

  const substrateAccountApi = useApi(
    (address: string) => apiService.getEvmAccountByAddress(address),
    {},
    { immediate: false }
  );

  const evmContractApi = useApi(
    (address: string) => apiService.getEvmContractByAddress(address),
    {},
    { immediate: false }
  );

  const detectSearchType = useCallback((input: string): SearchType => {
    const trimmedInput = input.trim();

    // Check for block number (numeric)
    if (isValidBlockNumber(trimmedInput)) {
      return 'block_number';
    }

    // Check for transaction hash or block hash (0x + 64 hex chars)
    if (isValidHash(trimmedInput)) {
      return 'transaction_hash'; // We'll try transaction first, then block, then substrate extrinsic
    }

    // Check for EVM address (0x + 40 hex chars)
    if (isValidEvmAddress(trimmedInput)) {
      return 'evm_account_address'; // We'll check both account and contract
    }

    // Check for SS58 address (starts with 5 + 47 chars)
    if (isValidSs58Address(trimmedInput)) {
      return 'ss58_account_address';
    }

    return 'unknown';
  }, []);

  const search = useCallback(async (searchQuery?: string): Promise<SearchResult> => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) {
      setResult(null);
      return null;
    }

    const detectedType = detectSearchType(queryToSearch);
    setSearchType(detectedType);

    try {
      let searchResult: SearchResult = null;

      switch (detectedType) {
        case 'block_number': {
          const blockNumber = parseInt(queryToSearch);
          
          // Try EVM block first
          try {
            const evmBlock = await evmBlockByNumberApi.execute(blockNumber);
            searchResult = { type: 'evm_block', data: evmBlock };
          } catch {
            // If EVM block fails, try Substrate block
            try {
              const substrateBlock = await substrateBlockByNumberApi.execute(blockNumber);
              searchResult = { type: 'substrate_block', data: substrateBlock };
            } catch {
              throw new Error('Block not found in either EVM or Substrate networks');
            }
          }
          break;
        }

        case 'transaction_hash': {
          // Try EVM transaction first
          try {
            const transaction = await evmTransactionApi.execute(queryToSearch);
            searchResult = { type: 'evm_transaction', data: transaction };
          } catch {
            // If EVM transaction fails, try as substrate extrinsic
            try {
              const substrateExtrinsic = await substrateExtrinsicApi.execute(queryToSearch);
              searchResult = { type: 'substrate_extrinsic', data: substrateExtrinsic };
            } catch {
              // If substrate extrinsic fails, try as block hash for both networks
              try {
                const evmBlock = await evmBlockByHashApi.execute(queryToSearch);
                searchResult = { type: 'evm_block', data: evmBlock };
              } catch {
                try {
                  const substrateBlock = await substrateBlockByHashApi.execute(queryToSearch);
                  searchResult = { type: 'substrate_block', data: substrateBlock };
                } catch {
                  throw new Error('Hash not found as transaction, extrinsic, or block in any network');
                }
              }
            }
          }
          break;
        }

        case 'evm_account_address': {
          // Try as contract first, then as regular account
          try {
            const contract = await evmContractApi.execute(queryToSearch);
            searchResult = { type: 'evm_contract', data: contract };
          } catch {
            try {
              const account = await evmAccountApi.execute(queryToSearch);
              searchResult = { type: 'evm_account', data: account };
            } catch {
              throw new Error('EVM address not found as contract or account');
            }
          }
          break;
        }

        case 'ss58_account_address': {
        try {
            const account = await substrateAccountApi.execute(queryToSearch);
            searchResult = { type: 'ss58_address', data: account };
        } catch {
            throw new Error('SS58 address not found');
        }
          break;
        }

        default:
          throw new Error('Invalid search query format');
      }

      setResult(searchResult);
      return searchResult;

    } catch (error) {
      const errorMessage = (error as Error).message || 'Search failed';
      setResult(null);
      throw new Error(errorMessage);
    }
  }, [
    query,
    detectSearchType,
    evmBlockByNumberApi,
    substrateBlockByNumberApi,
    evmBlockByHashApi,
    substrateBlockByHashApi,
    evmTransactionApi,
    substrateExtrinsicApi, // NEW: Added this dependency
    evmAccountApi,
    evmContractApi,
    substrateAccountApi
  ]);

  const clear = useCallback(() => {
    setQuery('');
    setSearchType('unknown');
    setResult(null);
  }, []);

  // Determine loading state from any of the API calls
  const loading = 
    evmBlockByNumberApi.loading ||
    substrateBlockByNumberApi.loading ||
    evmBlockByHashApi.loading ||
    substrateBlockByHashApi.loading ||
    evmTransactionApi.loading ||
    substrateExtrinsicApi.loading || // NEW: Added this
    evmAccountApi.loading ||
    evmContractApi.loading ||
    substrateAccountApi.loading;

  // Determine error state from any of the API calls
  const error = 
    evmBlockByNumberApi.error ||
    substrateBlockByNumberApi.error ||
    evmBlockByHashApi.error ||
    substrateBlockByHashApi.error ||
    evmTransactionApi.error ||
    substrateExtrinsicApi.error || // NEW: Added this
    evmAccountApi.error ||
    evmContractApi.error ||
    substrateAccountApi.error;

  return {
    query,
    setQuery,
    searchType,
    result,
    loading,
    error,
    search,
    clear,
    detectSearchType
  };
};
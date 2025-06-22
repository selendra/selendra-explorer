import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../../hooks';
import { 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [hasSearched, setHasSearched] = useState(false);
  
  const {
    result,
    loading,
    error,
    search,
    searchType
  } = useSearch();

  useEffect(() => {
    if (query && query.trim().length > 0) {
      setHasSearched(true);
      search(query.trim()).catch(console.error);
    }
  }, [query, search]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'evm_block':
      case 'substrate_block':
        return <CubeIcon className="h-6 w-6 text-blue-500" />;
      case 'evm_transaction':
      case 'substrate_extrinsic':
        return <ArrowsRightLeftIcon className="h-6 w-6 text-green-500" />;
      case 'evm_account':
      case 'ss58_address':
        return <UserIcon className="h-6 w-6 text-purple-500" />;
      case 'evm_contract':
        return <DocumentTextIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatResultData = (result: any) => {
    if (!result) return null;

    switch (result.type) {
      case 'evm_block':
        return {
          title: `EVM Block #${result.data.number.toLocaleString()}`,
          subtitle: `${result.data.transaction_count} transactions`,
          details: [
            { label: 'Hash', value: result.data.hash },
            { label: 'Timestamp', value: new Date(result.data.timestamp).toLocaleString() },
            { label: 'Gas Used', value: result.data.gas_used.toLocaleString() },
            { label: 'Validator', value: result.data.validator }
          ]
        };
      
      case 'substrate_block':
        return {
          title: `Substrate Block #${result.data.number.toLocaleString()}`,
          subtitle: `${result.data.extrinscs_len} extrinsics, ${result.data.event_len} events`,
          details: [
            { label: 'Hash', value: result.data.hash },
            { label: 'Timestamp', value: new Date(result.data.timestamp * 1000).toLocaleString() },
            { label: 'Parent Hash', value: result.data.parent_hash },
            { label: 'Finalized', value: result.data.is_finalize ? 'Yes' : 'No' }
          ]
        };

      case 'evm_transaction':
        return {
          title: 'EVM Transaction',
          subtitle: `Block ${result.data.block_number} • ${result.data.status}`,
          details: [
            { label: 'Hash', value: result.data.hash },
            { label: 'From', value: result.data.from },
            { label: 'To', value: result.data.to },
            { label: 'Value', value: `${result.data.value / 1e18} SEL` },
            { label: 'Gas Used', value: result.data.gas_used.toLocaleString() },
            { label: 'Timestamp', value: new Date(result.data.timestamp).toLocaleString() }
          ]
        };

      case 'substrate_extrinsic':
        return {
          title: 'Substrate Extrinsic',
          subtitle: `${result.data.call_module}.${result.data.call_function}`,
          details: [
            { label: 'Hash', value: result.data.hash },
            { label: 'Block', value: result.data.block_number },
            { label: 'Index', value: result.data.extrinsic_index },
            { label: 'Signer', value: result.data.signer },
            { label: 'Signed', value: result.data.is_signed ? 'Yes' : 'No' },
            { label: 'Timestamp', value: new Date(result.data.timestamp * 1000).toLocaleString() }
          ]
        };

      case 'evm_account':
        return {
          title: result.data.is_contract ? 'Contract Account' : 'EVM Account',
          subtitle: `Balance: ${result.data.balance_token} SEL`,
          details: [
            { label: 'Address', value: result.data.address },
            { label: 'Balance', value: `${result.data.balance_token} SEL` },
            { label: 'Nonce', value: result.data.nonce },
            { label: 'Type', value: result.data.is_contract ? 'Contract' : 'Account' },
            { label: 'Created', value: new Date(result.data.created_at).toLocaleString() }
          ]
        };

      case 'evm_contract':
        return {
          title: result.data.name || 'Smart Contract',
          subtitle: `${result.data.contract_type} • ${result.data.symbol}`,
          details: [
            { label: 'Address', value: result.data.address },
            { label: 'Name', value: result.data.name },
            { label: 'Symbol', value: result.data.symbol },
            { label: 'Type', value: result.data.contract_type },
            { label: 'Verified', value: result.data.is_verified ? 'Yes' : 'No' },
            { label: 'Decimals', value: result.data.decimals }
          ]
        };

      case 'ss58_address':
        return {
          title: 'SS58 Account',
          subtitle: `Balance: ${result.data.balance_token} SEL`,
          details: [
            { label: 'Address', value: result.data.address },
            { label: 'Balance', value: `${result.data.balance_token} SEL` },
            { label: 'Free Balance', value: `${result.data.free_balance} SEL` },
            { label: 'Nonce', value: result.data.nonce }
          ]
        };

      default:
        return null;
    }
  };

  const formattedResult = result ? formatResultData(result) : null;

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No search query</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please enter a search term in the search bar above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Results for: <span className="font-mono font-medium">"{query}"</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Search type: <span className="capitalize">{searchType.replace('_', ' ')}</span>
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <svg
              className="animate-spin h-6 w-6 text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">Searching...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Search Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasSearched && !loading && !error && !result && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No results found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No matching results found for "{query}". Try searching with a different term.
          </p>
          <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            <p>Search supports:</p>
            <ul className="mt-1 space-y-1">
              <li>• Block numbers (e.g., 12345)</li>
              <li>• Transaction hashes (0x...)</li>
              <li>• Extrinsic hashes (0x...)</li>
              <li>• EVM addresses (0x...)</li>
              <li>• SS58 addresses (5...)</li>
            </ul>
          </div>
        </div>
      )}

      {formattedResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              {getResultIcon(result!.type)}
              <div className="ml-3">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {formattedResult.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formattedResult.subtitle}
                </p>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              {formattedResult.details.map((detail, index) => (
                <div key={index} className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
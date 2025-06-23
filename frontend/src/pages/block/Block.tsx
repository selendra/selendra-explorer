import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEvmBlock, useEvmTransactionsByBlock, useSubstrateBlock, useSubstrateExtrinsicsByBlock } from '../../hooks';
import {DataTable, TimeAgo, AddressDisplay, NetworkBadge} from '../../components';
import { 
  CubeIcon, 
  ClockIcon, 
  ScaleIcon, 
  UserIcon, 
  DocumentTextIcon, 
  FireIcon, 
  CheckCircleIcon, 
  ArrowsRightLeftIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { EvmBlock, EvmTransaction, SubstrateBlock, SubstrateExtrinsic } from '@/types';

// Helper function to copy to clipboard with visual feedback
const copyToClipboard = (text: string, event: React.MouseEvent) => {
  event.preventDefault();
  navigator.clipboard.writeText(text);
  
  // Get the target element and its original title
  const target = event.currentTarget as HTMLElement;
  const originalTitle = target.getAttribute('title') || '';
  
  // Change the title to indicate copying
  target.setAttribute('title', 'Copied!');
  
  // Reset the title after 2 seconds
  setTimeout(() => {
    target.setAttribute('title', originalTitle);
  }, 2000);
};

interface BlockDetailsProps {
  networkType?: 'evm' | 'substrate';
}

const BlockDetails: React.FC<BlockDetailsProps> = ({ networkType = 'evm' }) => {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate = useNavigate();
  const [currentNetworkType, setCurrentNetworkType] = useState<'evm' | 'substrate'>(networkType);
  
  // Determine if blockId is a number or hash
  const isBlockNumber = blockId && /^\d+$/.test(blockId);
  const blockIdentifier = isBlockNumber ? parseInt(blockId!, 10) : blockId!;
  const identifierType = isBlockNumber ? 'number' : 'hash';

  // API hooks for EVM
  const evmBlockQuery = useEvmBlock(
    blockIdentifier, 
    identifierType
  );
  
  const evmTransactionsQuery = useEvmTransactionsByBlock(
    isBlockNumber ? parseInt(blockId!, 10) : undefined
  );

  // API hooks for Substrate
  const substrateBlockQuery = useSubstrateBlock(
    blockIdentifier,
    identifierType
  );

  const substrateExtrinsicsQuery = useSubstrateExtrinsicsByBlock(
    isBlockNumber ? parseInt(blockId!, 10) : undefined
  );

  // Auto-detect network type based on successful responses
  useEffect(() => {
    if (currentNetworkType === 'evm' && evmBlockQuery.error && !substrateBlockQuery.loading) {
      // Try substrate if EVM fails
      setCurrentNetworkType('substrate');
    } else if (currentNetworkType === 'substrate' && substrateBlockQuery.error && !evmBlockQuery.loading) {
      // Try EVM if substrate fails
      setCurrentNetworkType('evm');
    }
  }, [evmBlockQuery.error, substrateBlockQuery.error, evmBlockQuery.loading, substrateBlockQuery.loading, currentNetworkType]);

  // Select the appropriate data based on network type
  const blockQuery = currentNetworkType === 'evm' ? evmBlockQuery : substrateBlockQuery;
  const transactionsQuery = currentNetworkType === 'evm' ? evmTransactionsQuery : substrateExtrinsicsQuery;
  
  const block = blockQuery.data;
  const transactions = transactionsQuery.data || [];
  const isLoadingBlock = blockQuery.loading;
  const isLoadingTransactions = transactionsQuery.loading;
  const error = blockQuery.error;

  // Navigation helpers
  const getNavigationPath = (blockNumber: number) => {
    return currentNetworkType === 'evm' ? `/evm/blocks/${blockNumber}` : `/substrate/blocks/${blockNumber}`;
  };

  const getTransactionPath = (hash: string) => {
    return currentNetworkType === 'evm' ? `/evm/transactions/${hash}` : `/substrate/extrinsics/${hash}`;
  };

  const getAccountPath = (address: string) => {
    return currentNetworkType === 'evm' ? `/evm/accounts/${address}` : `/substrate/accounts/${address}`;
  };

  // Loading state
  if (isLoadingBlock) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center space-x-4">
          <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
        <div className="h-56 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !block) {
    return (
      <div className="text-center py-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex justify-center">
          <ExclamationTriangleIcon className="h-24 w-24 text-red-300 dark:text-red-600 mb-4" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Block Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          The block you are looking for (#{blockId}) doesn't exist or hasn't been indexed yet.
        </p>
        <div className="mt-6 space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Go Back
          </button>
          <Link
            to={currentNetworkType === 'evm' ? "/evm/blocks" : "/substrate/blocks"}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <CubeIcon className="h-5 w-5 mr-2" />
            View All Blocks
          </Link>
        </div>
      </div>
    );
  }

  // Prepare block data based on network type
  const isEvmBlock = currentNetworkType === 'evm';
  const blockNumber = block.number;
  const blockHash = block.hash;
  const parentHash = block.parent_hash;
  const timestamp = isEvmBlock ? block.timestamp : block.timestamp * 1000; // Substrate uses seconds
  const transactionCount = isEvmBlock 
    ? (block as EvmBlock).transaction_count 
    : (block as SubstrateBlock).extrinscs_len;

  // Navigation data
  const prevBlockNumber = blockNumber + 1;
  const nextBlockNumber = blockNumber - 1;
  
  // Calculate gas usage for EVM blocks
  const gasUsagePercentage = isEvmBlock && (block as EvmBlock).gas_limit ? 
    Math.min(100, ((block as EvmBlock).gas_used / (block as EvmBlock).gas_limit) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Network Type Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentNetworkType('evm')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentNetworkType === 'evm'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
            }`}
          >
            EVM Block
          </button>
          <button
            onClick={() => setCurrentNetworkType('substrate')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentNetworkType === 'substrate'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
            }`}
          >
            Substrate Block
          </button>
        </div>
      </div>

      {/* Block Summary Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row mb-2 md:mb-0">
          <div className="flex items-center">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl mr-4">
              <CubeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEvmBlock ? 'EVM ' : 'Substrate '}Block #{blockNumber.toLocaleString()}
                </h1>
                <NetworkBadge type={currentNetworkType} />
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full flex items-center">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  {isEvmBlock ? 'Finalized' : ((block as SubstrateBlock).is_finalize ? 'Finalized' : 'Pending')}
                </span>
              </div>
              <div className="mt-1 text-gray-600 dark:text-gray-300 flex items-center flex-wrap gap-2">
                <TimeAgo timestamp={timestamp} />
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {new Date(timestamp).toLocaleString()}
                </span>
                <button 
                  onClick={(e) => copyToClipboard(blockNumber.toString(), e)}
                  className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 ml-2"
                  title="Copy block number to clipboard"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-2 self-start">
            <button 
              onClick={() => blockQuery.refresh()}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Refresh block data"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
            {nextBlockNumber >= 0 && (
              <Link
                to={getNavigationPath(nextBlockNumber)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Link>
            )}
            <Link
              to={getNavigationPath(prevBlockNumber)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Block Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-300">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <ArrowsRightLeftIcon className="h-3 w-3 mr-1.5" />
              {isEvmBlock ? 'Transactions' : 'Extrinsics'}
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {transactionCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {transactionCount > 0 ? `${(transactionCount / 100).toFixed(2)}% of daily volume` : `No ${isEvmBlock ? 'transactions' : 'extrinsics'}`}
            </div>
          </div>
          
          {isEvmBlock && (
            <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-300">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                <ScaleIcon className="h-3 w-3 mr-1.5" />
                Size
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {((block as EvmBlock).size / 1024).toFixed(2)} KB
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(block as EvmBlock).size.toLocaleString()} bytes
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-300">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <UserIcon className="h-3 w-3 mr-1.5" />
              {isEvmBlock ? 'Validator' : 'Author'}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300 mr-2 flex-shrink-0"></div>
              {isEvmBlock ? (
                <AddressDisplay
                  address={(block as EvmBlock).validator}
                  networkType="evm"
                  truncate={true}
                  className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                />
              ) : (
                <span className="font-mono text-xs">
                  {block.hash ? `${block.hash.substring(0, 10)}...${block.hash.substring(block.hash.length - 8)}` : 'N/A'}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <ShieldCheckIcon className="h-3 w-3 mr-1" />
              Validated
            </div>
          </div>
          
          {!isEvmBlock && (
            <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-300">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                Events
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {(block as SubstrateBlock).event_len || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Runtime events
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Block Details and Gas/State Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Block Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Block Information</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div className="text-gray-500 dark:text-gray-400">Block Height</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white flex items-center group">
                {blockNumber.toLocaleString()}
                <button 
                  onClick={(e) => copyToClipboard(blockNumber.toString(), e)}
                  className="ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Timestamp</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {new Date(timestamp).toLocaleString()} <TimeAgo timestamp={timestamp} className="text-xs text-gray-500 dark:text-gray-400 ml-1" />
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">{isEvmBlock ? 'Transactions' : 'Extrinsics'}</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {transactionCount}
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Block Hash</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white flex items-center group flex-wrap">
                <span className="font-mono text-xs break-all">{blockHash}</span>
                <button 
                  onClick={(e) => copyToClipboard(blockHash, e)}
                  className="ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="text-gray-500 dark:text-gray-400">Parent Hash</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white flex items-center group flex-wrap">
                <Link to={getNavigationPath(blockNumber - 1)} className="font-mono text-xs hover:text-primary-600 dark:hover:text-primary-400 break-all">
                  {parentHash}
                </Link>
                <button 
                  onClick={(e) => copyToClipboard(parentHash, e)}
                  className="ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
              
              {isEvmBlock && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">Nonce</div>
                  <div className="col-span-2 font-medium text-gray-900 dark:text-white font-mono">
                    {(block as EvmBlock).nonce}
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400">Size</div>
                  <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                    {(block as EvmBlock).size.toLocaleString()} bytes ({((block as EvmBlock).size / 1024).toFixed(2)} KB)
                  </div>
                </>
              )}

              {!isEvmBlock && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">State Root</div>
                  <div className="col-span-2 font-medium text-gray-900 dark:text-white flex items-center group flex-wrap">
                    <span className="font-mono text-xs break-all">{(block as SubstrateBlock).state_root}</span>
                    <button 
                      onClick={(e) => copyToClipboard((block as SubstrateBlock).state_root, e)}
                      className="ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy to clipboard"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">Extrinsics Root</div>
                  <div className="col-span-2 font-medium text-gray-900 dark:text-white flex items-center group flex-wrap">
                    <span className="font-mono text-xs break-all">{(block as SubstrateBlock).extrinsics_root}</span>
                    <button 
                      onClick={(e) => copyToClipboard((block as SubstrateBlock).extrinsics_root, e)}
                      className="ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy to clipboard"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Gas Information (EVM) or Additional Details (Substrate) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center">
            {isEvmBlock ? (
              <>
                <FireIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gas & Fees</h2>
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Additional Details</h2>
              </>
            )}
          </div>
          <div className="p-6 space-y-6">
            {isEvmBlock ? (
              <>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FireIcon className="h-4 w-4 mr-1.5" />
                      Gas Used vs Gas Limit
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {gasUsagePercentage.toFixed(2)}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" style={{ width: `${gasUsagePercentage}%` }}></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{(block as EvmBlock).gas_used.toLocaleString()} used</span>
                    <span>{(block as EvmBlock).gas_limit.toLocaleString()} limit</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
                  <div className="text-gray-500 dark:text-gray-400">Gas Used</div>
                  <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                    {(block as EvmBlock).gas_used.toLocaleString()} ({gasUsagePercentage.toFixed(2)}%)
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400">Gas Limit</div>
                  <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                    {(block as EvmBlock).gas_limit.toLocaleString()}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">Base Fee</div>
                  <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                    {((block as EvmBlock).base_fee / 1e9).toFixed(4)} Gwei
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400">Burnt Fees</div>
                  <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                    {(block as EvmBlock).burn_fee.toFixed(6)} SEL
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Extra Data (Hex)</div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700 overflow-auto">
                    <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                      {(block as EvmBlock).extra_data || '0x'}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Extra Data (UTF-8)</div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700 overflow-auto">
                    <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                      {(block as EvmBlock).extra_data ? 
                        ((block as EvmBlock).extra_data.startsWith('0x') ? 
                          ((block as EvmBlock).extra_data.length > 2 ? "Selendra/v1.0.0" : "") : 
                          "Not available") : 
                        "Not available"}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              // Substrate block additional details
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div className="text-gray-500 dark:text-gray-400">Finalized</div>
                <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    (block as SubstrateBlock).is_finalize 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    {(block as SubstrateBlock).is_finalize ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="text-gray-500 dark:text-gray-400">Events</div>
                <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                  {(block as SubstrateBlock).event_len || 0}
                </div>
                
                <div className="text-gray-500 dark:text-gray-400">Extrinsics</div>
                <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                  {(block as SubstrateBlock).extrinscs_len || 0}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Transactions/Extrinsics List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEvmBlock ? 'Transactions' : 'Extrinsics'}
            </h2>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
              {transactionCount}
            </span>
          </div>
          {isLoadingTransactions && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          )}
        </div>
        
        {transactions.length > 0 ? (
          <DataTable<any>
            columns={isEvmBlock ? [
              // EVM Transaction columns
              {
                header: 'Transaction Hash',
                accessor: (tx) => (
                  <Link to={getTransactionPath(tx.hash)} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm flex items-center">
                    <CodeBracketIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {`${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}`}
                  </Link>
                ),
              },
              {
                header: 'Method',
                accessor: (tx) => (
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                    {tx.transaction_method || 'Transfer'}
                  </span>
                ),
              },
              {
                header: 'From',
                accessor: (tx) => (
                  <Link to={getAccountPath(tx.from)} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm truncate block max-w-[120px]">
                    {`${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`}
                  </Link>
                ),
              },
              {
                header: 'To',
                accessor: (tx) => 
                  tx.to ? (
                    <Link to={getAccountPath(tx.to)} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm truncate block max-w-[120px]">
                      {`${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}`}
                    </Link>
                  ) : (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md">
                      Contract Creation
                    </span>
                  ),
              },
              {
                header: 'Value',
                accessor: (tx) => (
                  <div className="text-right">
                    <div className="font-medium">{(tx.value / 1e18).toFixed(6)} SEL</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ${((tx.value / 1e18) * 0.04).toFixed(2)}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Gas Fee',
                accessor: (tx) => (
                  <div className="text-right text-sm">
                    <div className="font-medium">{(tx.fee / 1e18).toFixed(6)} SEL</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.gas_used.toLocaleString()} gas
                    </div>
                  </div>
                ),
              },
              {
                header: 'Status',
                accessor: (tx) => (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    tx.status === 'Success' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : tx.status === 'Failed'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {tx.status}
                  </span>
                ),
              },
              {
                header: '',
                accessor: (tx) => (
                  <Link to={getTransactionPath(tx.hash)} className="flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <ChevronRightIcon className="h-5 w-5" />
                  </Link>
                ),
                className: 'w-10',
              },
            ] : [
              // Substrate Extrinsic columns
              {
                header: 'Extrinsic Hash',
                accessor: (ext) => (
                  <Link to={getTransactionPath((ext as unknown as SubstrateExtrinsic).hash)} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm flex items-center">
                    <CodeBracketIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {`${(ext as unknown as SubstrateExtrinsic).hash.substring(0, 10)}...${(ext as unknown as SubstrateExtrinsic).hash.substring((ext as unknown as SubstrateExtrinsic).hash.length - 8)}`}
                  </Link>
                ),
              },
              {
                header: 'Index',
                accessor: (ext) => (
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                    {(ext as unknown as SubstrateExtrinsic).extrinsic_index}
                  </span>
                ),
              },
              {
                header: 'Module.Call',
                accessor: (ext) => (
                  <div>
                    <div className="font-medium text-sm">{(ext as unknown as SubstrateExtrinsic).call_module}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{(ext as unknown as SubstrateExtrinsic).call_function}</div>
                  </div>
                ),
              },
              {
                header: 'Signer',
                accessor: (ext) => 
                    (ext as unknown as SubstrateExtrinsic).is_signed ? (
                    <Link to={getAccountPath((ext as unknown as SubstrateExtrinsic).signer)} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm truncate block max-w-[120px]">
                      {`${(ext as unknown as SubstrateExtrinsic).signer.substring(0, 6)}...${(ext as unknown as SubstrateExtrinsic).signer.substring((ext as unknown as SubstrateExtrinsic).signer.length - 4)}`}
                    </Link>
                  ) : (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md">
                      Unsigned
                    </span>
                  ),
              },
              {
                header: 'Arguments',
                accessor: (ext) => (
                  <div className="max-w-[200px] truncate text-xs font-mono text-gray-600 dark:text-gray-400">
                    {(ext as unknown as SubstrateExtrinsic).args ? JSON.stringify(JSON.parse((ext as unknown as SubstrateExtrinsic).args)).substring(0, 50) + '...' : 'N/A'}
                  </div>
                ),
              },
              {
                header: 'Time',
                accessor: (ext) => (
                  <div className="text-right text-sm">
                    <TimeAgo timestamp={ext.timestamp * 1000} />
                  </div>
                ),
              },
              {
                header: '',
                accessor: (ext) => (
                  <Link to={getTransactionPath(ext.hash)} className="flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <ChevronRightIcon className="h-5 w-5" />
                  </Link>
                ),
                className: 'w-10',
              },
            ]}
            data={isEvmBlock ? transactions as EvmTransaction[] : transactions as unknown as SubstrateExtrinsic[]}
            keyExtractor={(item) => item.hash}
            isLoading={isLoadingTransactions}
            emptyMessage={`No ${isEvmBlock ? 'transactions' : 'extrinsics'} in this block.`}
            highlightOnHover={true}
            striped={true}
          />
        ) : (
          <div className="p-10 text-center">
            <ArrowsRightLeftIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              No {isEvmBlock ? 'Transactions' : 'Extrinsics'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
              This block doesn't contain any {isEvmBlock ? 'transactions' : 'extrinsics'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockDetails;
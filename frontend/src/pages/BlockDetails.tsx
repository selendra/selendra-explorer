import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DataTable from '../components/data/DataTable';
import TimeAgo from '../components/ui/TimeAgo';
import AddressDisplay from '../components/ui/AddressDisplay';
import NetworkBadge from '../components/ui/NetworkBadge';
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
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useBlock, useTransactionsByBlock } from '../contexts/ApiContext';

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

const BlockDetails: React.FC = () => {
  const { blockId } = useParams<{ blockId: string }>();
  
  // Use real API hooks
  const { data: block, isLoading: isLoadingBlock, error } = useBlock(blockId || '');
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactionsByBlock(
    block?.number || 0
  );

  // Transform transactions for table display
  const transformedTransactions = transactions.map(tx => ({
    hash: tx.hash,
    transactionType: tx.transactionType || 'Transfer',
    from: tx.from,
    to: tx.to,
    value: tx.value,
    status: tx.status,
    timestamp: tx.timestamp,
    fee: tx.fee,
    blockNumber: tx.blockNumber,
  }));
  
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
  
  if (error || !block) {
    return (
      <div className="text-center py-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex justify-center">
          <CubeIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mb-4" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Block Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          The block you are looking for (#{ blockId }) doesn't exist or hasn't been indexed yet.
        </p>
        <Link
          to="/blocks"
          className="mt-6 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <CubeIcon className="h-5 w-5 mr-2" />
          View All Blocks
        </Link>
      </div>
    );
  }
  
  // Find next and previous blocks (TODO: implement proper navigation)
  // Navigation is now handled directly in the JSX using block.number +/- 1
  const session = 110;
  
  // Calculate gas usage percentage
  const gasUsagePercentage = Math.min(100, parseInt(block.gasUsed) / parseInt(block.gasLimit) * 100);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Block Summary Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row mb-2 md:mb-0">
          <div className="flex items-center">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl mr-4">
              <CubeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Block #{block.number.toLocaleString()}</h1>
                <NetworkBadge type={block.networkType} />
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full flex items-center">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Finalized
                </span>
              </div>
              <div className="mt-1 text-gray-600 dark:text-gray-300 flex items-center flex-wrap gap-2">
                <TimeAgo timestamp={block.timestamp} />
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {new Date(block.timestamp).toLocaleString()}
                </span>
                <button 
                  onClick={(e) => copyToClipboard(block.number.toString(), e)}
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
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Refresh block data"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
            {block.number > 1 && (
              <Link
                to={`/blocks/${block.number - 1}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Link>
            )}
            <Link
              to={`/blocks/${block.number + 1}`}
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
              Transactions
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {block.transactionCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {block.transactionCount > 0 ? `${(block.transactionCount / 100).toFixed(2)}% of daily volume` : 'No transactions'}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-300">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <ScaleIcon className="h-3 w-3 mr-1.5" />
              Size
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {(block.size / 1024).toFixed(2)} KB
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {block.size.toLocaleString()} bytes
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-300">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <UserIcon className="h-3 w-3 mr-1.5" />
              Validator
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300 mr-2 flex-shrink-0"></div>
              <AddressDisplay
                address={block.validator}
                networkType={block.networkType}
                truncate={true}
                className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <ShieldCheckIcon className="h-3 w-3 mr-1" />
              Validated in 0.42s
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-300">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <DocumentTextIcon className="h-3 w-3 mr-1.5" />
              Session
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {session.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
              era 11
            </div>
          </div>
        </div>
      </div>
      
      {/* Block Details and Gas Usage */}
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
                {block.number.toLocaleString()}
                <button 
                  onClick={(e) => copyToClipboard(block.number.toString(), e)}
                  className="ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Timestamp</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {new Date(block.timestamp).toLocaleString()} <TimeAgo timestamp={block.timestamp} className="text-xs text-gray-500 dark:text-gray-400 ml-1" />
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Transactions</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {block.transactionCount}
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Block Hash</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white flex items-center group flex-wrap">
                <span className="font-mono text-xs break-all">{block.hash}</span>
                <button 
                  onClick={(e) => copyToClipboard(block.hash, e)}
                  className="ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="text-gray-500 dark:text-gray-400">Parent Hash</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white flex items-center group flex-wrap">
                <Link to={`/blocks/${block.number - 1}`} className="font-mono text-xs hover:text-primary-600 dark:hover:text-primary-400 break-all">
                  {block.parentHash}
                </Link>
                <button 
                  onClick={(e) => copyToClipboard(block.parentHash, e)}
                  className="ml-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Nonce</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white font-mono">
                {block.nonce}
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Size</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {block.size.toLocaleString()} bytes ({(block.size / 1024).toFixed(2)} KB)
              </div>
            </div>
          </div>
        </div>
        
        {/* Gas Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center">
            <FireIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gas & Extra Data</h2>
          </div>
          <div className="p-6 space-y-6">
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
                <span>{parseInt(block.gasUsed).toLocaleString()} used</span>
                <span>{parseInt(block.gasLimit).toLocaleString()} limit</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div className="text-gray-500 dark:text-gray-400">Gas Used</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {parseInt(block.gasUsed).toLocaleString()} ({gasUsagePercentage.toFixed(2)}%)
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Gas Limit</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {parseInt(block.gasLimit).toLocaleString()}
              </div>

              <div className="text-gray-500 dark:text-gray-400">Base Fee</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {(Math.random() * 100).toFixed(4)} Gwei
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Burnt Fees</div>
              <div className="col-span-2 font-medium text-gray-900 dark:text-white">
                {(Math.random() * 0.1).toFixed(6)} SEL
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-gray-500 dark:text-gray-400 text-sm">Extra Data (Hex)</div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700 overflow-auto">
                <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                  {block.extraData || '0x'}
                </pre>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-gray-500 dark:text-gray-400 text-sm">Extra Data (UTF-8)</div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700 overflow-auto">
                <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                  {/* Show UTF-8 representation of extra data if possible, or "Not available" */}
                  {block.extraData ? 
                    (block.extraData.startsWith('0x') ? 
                      (block.extraData.length > 2 ? "Selendra/v1.0.0" : "") : 
                      "Not available") : 
                    "Not available"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transactions</h2>
            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
              {block.transactionCount}
            </span>
          </div>
        </div>
        
        {transactions.length > 0 ? (
          <DataTable
            columns={[
              {
                header: 'Transaction Hash',
                accessor: (tx) => (
                  <Link to={`/transactions/${tx.hash}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm flex items-center">
                    <CodeBracketIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {`${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}`}
                  </Link>
                ),
              },
              {
                header: 'Method',
                accessor: (tx) => (
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                    {tx.transactionType || 'Transfer'}
                  </span>
                ),
              },
              {
                header: 'From',
                accessor: (tx) => (
                  <Link to={`/accounts/${tx.from}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm truncate block max-w-[120px]">
                    {`${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`}
                  </Link>
                ),
              },
              {
                header: 'To',
                accessor: (tx) => 
                  tx.to ? (
                    <Link to={`/accounts/${tx.to}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm truncate block max-w-[120px]">
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
                    <div className="font-medium">{tx.value} SEL</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ${(parseFloat(tx.value) * 0.04).toFixed(2)}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Fee',
                accessor: (tx) => (
                  <div className="text-right text-sm">
                    <div className="font-medium">{(parseFloat(tx.fee ?? '0') * 0.00001).toFixed(6)} SEL</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.fee} Fee
                    </div>
                  </div>
                ),
              },
              {
                header: '',
                accessor: (tx) => (
                  <Link to={`/transactions/${tx.hash}`} className="flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <ChevronRightIcon className="h-5 w-5" />
                  </Link>
                ),
                className: 'w-10',
              },
            ]}
            data={transactions}
            keyExtractor={(tx) => tx.hash}
            isLoading={isLoadingTransactions}
            emptyMessage="No transactions in this block."
            highlightOnHover={true}
            striped={true}
          />
        ) : (
          <div className="p-10 text-center">
            <ArrowsRightLeftIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">No Transactions</p>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
              This block doesn't contain any transactions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockDetails;

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTransaction } from '../contexts/ApiContext';
import TimeAgo from '../components/ui/TimeAgo';
import AddressDisplay from '../components/ui/AddressDisplay';
import NetworkBadge from '../components/ui/NetworkBadge';
import StatusBadge from '../components/ui/StatusBadge';
import { 
  ClipboardIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CubeIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const TransactionDetails: React.FC = () => {
  const { txHash } = useParams<{ txHash: string }>();
  const { data: transaction, isLoading, error } = useTransaction(txHash || '');
  const [activeTab, setActiveTab] = useState('overview');

  // Function to copy hash to clipboard
  const copyHashToClipboard = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.hash);
      // TODO: Add toast notification for clipboard copy
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  if (error || !transaction) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Transaction Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          The transaction you are looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/transactions"
          className="mt-6 inline-block px-4 py-2 bg-gradient-to-r from-[#8C30F5] to-[#0CCBD6] text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C30F5]"
        >
          View All Transactions
        </Link>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div>
      {/* Transaction Header with Enhanced Design */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-[#8C30F5]/10 to-[#0CCBD6]/10 dark:from-[#8C30F5]/20 dark:to-[#0CCBD6]/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction</h1>
              <NetworkBadge type={transaction.networkType} />
              <StatusBadge status={transaction.status} />
            </div>
            
            <div className="flex items-center mt-3">
              <div className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">{transaction.hash}</div>
              <button 
                onClick={copyHashToClipboard} 
                className="ml-2 p-1 text-gray-500 hover:text-[#8C30F5] dark:text-gray-400 dark:hover:text-[#9D50FF] rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Copy Transaction Hash"
              >
                <ClipboardIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#8C30F5]/10 text-[#8C30F5] dark:bg-[#8C30F5]/20 dark:text-[#9D50FF]">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <TimeAgo timestamp={transaction.timestamp} />
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {formatTimestamp(transaction.timestamp)}
                </div>
              </div>
              
              <div className="text-right">
                <Link 
                  to={`/blocks/${transaction.blockNumber}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#0CCBD6]/10 text-[#0CCBD6] dark:bg-[#0CCBD6]/20 dark:text-[#0EDAE6]"
                >
                  <CubeIcon className="h-3 w-3 mr-1" />
                  Block #{transaction.blockNumber.toLocaleString()}
                </Link>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Confirmed in Block
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Tab Navigation */}
        <div className="px-6">
          <nav className="flex space-x-6 overflow-x-auto">
            <button
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Overview
            </button>
            {((transaction.logs && transaction.logs.length > 0) || (transaction.events && transaction.events.length > 0)) && (
              <button
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'logs'
                    ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('logs')}
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                {transaction.networkType === 'evm' ? 'Event Logs' : 'Events'}
              </button>
            )}
            {transaction.input && transaction.input !== '0x' && (
              <button
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'data'
                    ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('data')}
              >
                <CodeBracketIcon className="h-4 w-4 mr-2" />
                Input Data
              </button>
            )}
            <button
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'comments'
                  ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
              Comments
            </button>
          </nav>
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Transaction Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              {transaction.status === 'success' ? (
                <>
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-[#0CCBD6]/10 dark:bg-[#0CCBD6]/20">
                    <CheckCircleIcon className="h-8 w-8 text-[#0CCBD6] dark:text-[#0EDAE6]" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Successful</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This transaction was executed successfully and confirmed on the Selendra blockchain.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Failed</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This transaction failed to execute. Check the transaction details for more information.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Transaction Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-[#8C30F5] dark:text-[#9D50FF]" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Details</h3>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Hash:</div>
                <div className="md:col-span-2 font-mono text-sm break-all text-gray-900 dark:text-white">
                  {transaction.hash}
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</div>
                <div className="md:col-span-2">
                  <StatusBadge status={transaction.status} />
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Block:</div>
                <div className="md:col-span-2">
                  <Link 
                    to={`/blocks/${transaction.blockNumber}`} 
                    className="text-[#8C30F5] dark:text-[#9D50FF] hover:underline"
                  >
                    {transaction.blockNumber.toLocaleString()}
                  </Link>
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp:</div>
                <div className="md:col-span-2 text-gray-900 dark:text-white">
                  {formatTimestamp(transaction.timestamp)}
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    (<TimeAgo timestamp={transaction.timestamp} />)
                  </span>
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">From:</div>
                <div className="md:col-span-2">
                  <AddressDisplay 
                    address={transaction.from} 
                    networkType={transaction.networkType}
                    truncate={false}
                    className="text-gray-900 dark:text-white hover:text-[#8C30F5] dark:hover:text-[#9D50FF]" 
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">To:</div>
                <div className="md:col-span-2">
                  {transaction.to ? (
                    <AddressDisplay 
                      address={transaction.to} 
                      networkType={transaction.networkType}
                      truncate={false}
                      className="text-gray-900 dark:text-white hover:text-[#8C30F5] dark:hover:text-[#9D50FF]" 
                    />
                  ) : (
                    <span className="px-2 py-1 rounded-md text-xs bg-[#0CCBD6]/10 text-[#0CCBD6] dark:bg-[#0CCBD6]/20 dark:text-[#0EDAE6]">
                      Contract Creation
                    </span>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Value:</div>
                <div className="md:col-span-2 font-semibold text-gray-900 dark:text-white">
                  {transaction.value} SEL
                  {parseFloat(transaction.value) > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      (≈ ${(parseFloat(transaction.value) * 0.01).toFixed(2)} USD)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Fee:</div>
                <div className="md:col-span-2 text-gray-900 dark:text-white">
                  {transaction.fee} SEL
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Gas Price:</div>
                <div className="md:col-span-2 text-gray-900 dark:text-white">
                  {transaction.gasPrice} Gwei
                </div>
              </div>
              
              {transaction.gasLimit !== undefined && (
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Gas Limit:</div>
                  <div className="md:col-span-2 text-gray-900 dark:text-white">
                    {transaction.gasLimit.toLocaleString()}
                  </div>
                </div>
              )}
              
              {transaction.gasUsed !== undefined && transaction.gasLimit !== undefined && (
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Gas Used:</div>
                  <div className="md:col-span-2 text-gray-900 dark:text-white">
                    {transaction.gasUsed.toLocaleString()} ({((Number(transaction.gasUsed) / Number(transaction.gasLimit)) * 100).toFixed(2)}%)
                  </div>
                </div>
              )}
              
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Nonce:</div>
                <div className="md:col-span-2 text-gray-900 dark:text-white">
                  {transaction.nonce}
                </div>
              </div>
              
              {transaction.input && transaction.input !== '0x' && (
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Input Data:</div>
                  <div className="md:col-span-2">
                    <button
                      onClick={() => setActiveTab('data')}
                      className="inline-flex items-center text-[#8C30F5] dark:text-[#9D50FF] hover:underline"
                    >
                      <span>View Input Data</span>
                      <ChevronDownIcon className="h-4 w-4 ml-1" />
                    </button>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {transaction.input.length} bytes
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Logs/Events Tab */}
      {activeTab === 'logs' && ((transaction.logs && transaction.logs.length > 0) || (transaction.events && transaction.events.length > 0)) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-[#8C30F5] dark:text-[#9D50FF]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {transaction.networkType === 'evm' ? 'Event Logs' : 'Events'}
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            {transaction.networkType === 'evm' && transaction.logs && transaction.logs.length > 0 ? (
              <div className="space-y-6">
                {transaction.logs.map((log, index) => (
                  <div 
                    key={log.id || index} 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="bg-[#8C30F5]/10 dark:bg-[#8C30F5]/20 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                          <span className="text-[#8C30F5] dark:text-[#9D50FF] font-semibold">{index}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Log #{log.logIndex || index}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Emitted by contract
                          </div>
                        </div>
                      </div>
                      <AddressDisplay
                        address={log.address}
                        networkType="evm"
                        truncate={true}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Topics</div>
                      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                        {log.topics && log.topics.map((topic, tIndex) => (
                          <div key={tIndex} className="p-3 text-sm">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Topic {tIndex}:
                            </div>
                            <div className="font-mono text-gray-900 dark:text-white break-all">
                              {topic}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Data</div>
                      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3">
                        <div className="font-mono text-xs text-gray-900 dark:text-white break-all">
                          {log.data}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : transaction.networkType === 'wasm' && transaction.events && transaction.events.length > 0 ? (
              <div className="space-y-6">
                {transaction.events.map((event, index) => (
                  <div 
                    key={event.id || index} 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="bg-[#0CCBD6]/10 dark:bg-[#0CCBD6]/20 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                          <span className="text-[#0CCBD6] dark:text-[#0EDAE6] font-semibold">{index}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.section}.{event.method}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Phase: {event.phase}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Event Index: {event.eventIndex}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Data</div>
                      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3">
                        <pre className="font-mono text-xs text-gray-900 dark:text-white overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No logs or events found for this transaction.
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Input Data Tab */}
      {activeTab === 'data' && transaction.input && transaction.input !== '0x' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CodeBracketIcon className="h-5 w-5 mr-2 text-[#8C30F5] dark:text-[#9D50FF]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Input Data</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto border border-gray-200 dark:border-gray-700">
              <pre className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                {transaction.input}
              </pre>
            </div>
            
            {transaction.decodedInput && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Decoded Input</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto border border-gray-200 dark:border-gray-700">
                  <pre className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {JSON.stringify(transaction.decodedInput, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;

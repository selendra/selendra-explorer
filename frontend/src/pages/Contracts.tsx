import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContracts } from '../contexts/ApiContext';
import DataTable from '../components/data/DataTable';
import Pagination from '../components/ui/Pagination';
import TimeAgo from '../components/ui/TimeAgo';
import AddressDisplay from '../components/ui/AddressDisplay';
import NetworkBadge from '../components/ui/NetworkBadge';
import { 
  CodeBracketIcon, 
  ArrowPathIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Contracts: React.FC = () => {
  const [page, setPage] = useState(1);
  const [networkType, setNetworkType] = useState<'evm' | 'wasm' | undefined>(undefined);
  const pageSize = 20;
  const { data, isLoading } = useContracts(page, pageSize);
  
  // TODO: Apply networkType filter client-side since API doesn't support it yet
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const copyToClipboard = (text: string | null) => {
    if (text) {
      navigator.clipboard.writeText(text);
      // Could add toast notification here
    }
  };
  
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <CodeBracketIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
            Smart Contracts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Browse all smart contracts on the Selendra blockchain. Selendra supports both EVM and Wasm smart contracts.
          </p>
        </div>
        
        <button 
          className="btn-gradient self-start flex items-center px-5 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all hover:shadow-md"
          onClick={() => window.location.reload()}
          aria-label="Refresh contracts"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Filter Controls */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <GlobeAltIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
          Filter Contracts
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setNetworkType(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              networkType === undefined
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-500'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
            }`}
          >
            All Contracts
          </button>
          <button
            onClick={() => setNetworkType('evm')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              networkType === 'evm'
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-500'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
            }`}
          >
            EVM Contracts
          </button>
          <button
            onClick={() => setNetworkType('wasm')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              networkType === 'wasm'
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-500'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
            }`}
          >
            Wasm Contracts
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <CodeBracketIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Total Contracts
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data ? (
              data.totalCount.toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            New contracts (24h): +18
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <CpuChipIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            {networkType === 'evm' ? 'EVM Contracts' : 
             networkType === 'wasm' ? 'Wasm Contracts' : 'EVM Contracts'}
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data?.totalCount ? (
              networkType === 'wasm' ? 
                Math.floor(data.totalCount * 0.35).toLocaleString() : 
                networkType === 'evm' ? 
                  data.totalCount.toLocaleString() : 
                  Math.floor(data.totalCount * 0.65).toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {networkType === 'evm' ? (
              <span className="text-primary-600 dark:text-primary-400">100%</span>
            ) : networkType === 'wasm' ? (
              <span className="text-secondary-600 dark:text-secondary-400">100%</span>
            ) : (
              <span className="text-primary-600 dark:text-primary-400">65%</span>
            )} of total contracts
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <CircleStackIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            {networkType === 'wasm' ? 'Wasm Contracts' :
             networkType === 'evm' ? 'Verified Contracts' : 'Wasm Contracts'}
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data?.totalCount ? (
              networkType === 'evm' ? 
                Math.floor(data.totalCount * 0.4).toLocaleString() : 
                networkType === 'wasm' ? 
                  data.totalCount.toLocaleString() : 
                  Math.floor(data.totalCount * 0.35).toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {networkType === 'evm' ? (
              <span className="text-green-600 dark:text-green-400">40%</span>
            ) : networkType === 'wasm' ? (
              <span className="text-secondary-600 dark:text-secondary-400">100%</span>
            ) : (
              <span className="text-secondary-600 dark:text-secondary-400">35%</span>
            )} of {networkType || 'total'} contracts
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <CodeBracketIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            {networkType === 'evm' ? 'EVM Smart Contracts' : 
             networkType === 'wasm' ? 'Wasm Smart Contracts' : 'All Smart Contracts'}
          </h2>
          
          {!isLoading && data && (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
              Showing contracts {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.totalCount)} of {data.totalCount.toLocaleString()}
            </div>
          )}
        </div>
        
        <DataTable
          columns={[
            {
              header: 'Address',
              accessor: (contract) => (
                <div className="flex items-center group">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 mr-3 flex items-center justify-center ${
                    contract.verified 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <CodeBracketIcon className={`h-4 w-4 ${
                      contract.verified 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <Link to={`/contracts/${contract.address}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm truncate max-w-[120px] sm:max-w-[160px] inline-block">
                      {`${contract.address.substring(0, 8)}...${contract.address.substring(contract.address.length - 6)}`}
                    </Link>
                    <button 
                      onClick={() => copyToClipboard(contract.address)} 
                      className="ml-1.5 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Copy contract address"
                    >
                      <DocumentDuplicateIcon className="h-3.5 w-3.5 inline-block" />
                    </button>
                  </div>
                </div>
              ),
            },
            {
              header: 'Name',
              accessor: (contract) => (
                <div className="font-medium">
                  {contract.name || 'Unnamed Contract'}
                  {contract.name && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {contract.contractType || 'Unknown Type'}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: 'Type',
              accessor: (contract) => (
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs">
                    {contract.contractType || 'Unknown'}
                  </span>
                  <NetworkBadge type={contract.networkType} />
                </div>
              ),
            },
            {
              header: 'Creator',
              accessor: (contract) => (
                <div className="flex items-center group">
                  <AddressDisplay
                    address={contract.creator}
                    networkType={contract.networkType}
                    truncate={true}
                    className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  />
                  <button 
                    onClick={() => copyToClipboard(contract.creator)} 
                    className="ml-1.5 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Copy creator address"
                  >
                    <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            },
            {
              header: 'Created',
              accessor: (contract) => (
                <div className="flex flex-col">
                  <TimeAgo timestamp={contract.createdAt} className="text-gray-900 dark:text-white" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ),
            },
            {
              header: 'Verified',
              accessor: (contract) => (
                <div className="flex justify-center">
                  {contract.verified ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                      Unverified
                    </span>
                  )}
                </div>
              ),
              className: 'text-center',
            },
            {
              header: '',
              accessor: (contract) => (
                <Link to={`/contracts/${contract.address}`} className="flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              ),
              className: 'w-10',
            },
          ]}
          data={data?.items || []}
          keyExtractor={(contract) => contract.id}
          isLoading={isLoading}
          emptyMessage="No contracts found."
          loadingRows={10}
          highlightOnHover={true}
          striped={true}
        />
        
        {data && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Contracts;

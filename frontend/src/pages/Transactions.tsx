import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTransactions } from '../contexts/ApiContext';
import DataTable from '../components/data/DataTable';
import Pagination from '../components/ui/Pagination';
import TimeAgo from '../components/ui/TimeAgo';
import AddressDisplay from '../components/ui/AddressDisplay';
import NetworkBadge from '../components/ui/NetworkBadge';
import StatusBadge from '../components/ui/StatusBadge';
import { 
  ArrowPathIcon, 
  ArrowsRightLeftIcon, 
  ChevronRightIcon, 
  ClockIcon,
  CubeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const Transactions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const address = searchParams.get('address') || undefined;
  
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useTransactions(page, pageSize, address);
  
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
            <ArrowsRightLeftIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
            {address ? 'Address Transactions' : 'Transactions'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            {address
              ? `Transactions for address ${address.substring(0, 8)}...${address.substring(address.length - 6)}`
              : 'Browse all transactions on the Selendra blockchain. Transactions include token transfers, contract calls, and contract deployments.'}
          </p>
        </div>
        
        <button 
          className="btn-gradient self-start flex items-center px-5 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all hover:shadow-md"
          onClick={() => window.location.reload()}
          aria-label="Refresh transactions"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300 group">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <ClockIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Latest Transaction
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {!isLoading && data?.items[0] ? (
              <div className="flex items-center">
                <Link to={`/transactions/${data.items[0].hash}`} className="font-mono truncate">
                  {`${data.items[0].hash.substring(0, 10)}...${data.items[0].hash.substring(data.items[0].hash.length - 8)}`}
                </Link>
                <button 
                  onClick={() => copyToClipboard(data.items[0].hash)} 
                  className="ml-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  aria-label="Copy transaction hash"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse"></div>
            )}
          </div>
          {!isLoading && data?.items[0] && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <TimeAgo timestamp={data.items[0].timestamp} />
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <ArrowsRightLeftIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Total Transactions
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data ? (
              data.totalCount.toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Over the last 24 hours: +2,345
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <CubeIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Average Tx Fee
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading ? "0.000435 SEL" : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            ≈ $0.0174
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            {address ? 'Address Transactions' : 'Recent Transactions'}
          </h2>
          
          {!isLoading && data && (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
              Showing transactions {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.totalCount)} of {data.totalCount.toLocaleString()}
            </div>
          )}
        </div>
        
        <DataTable
          columns={[
            {
              header: 'Hash',
              accessor: (tx) => (
                <div className="flex items-center group">
                  <Link to={`/transactions/${tx.hash}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm truncate max-w-[120px] sm:max-w-[160px]">
                    {`${tx.hash.substring(0, 8)}...${tx.hash.substring(tx.hash.length - 6)}`}
                  </Link>
                  <button 
                    onClick={() => copyToClipboard(tx.hash)} 
                    className="ml-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Copy transaction hash"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
            {
              header: 'Block',
              accessor: (tx) => (
                <Link to={`/blocks/${tx.blockNumber}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium group flex items-center">
                  {tx.blockNumber.toLocaleString()}
                  <CubeIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ),
            },
            {
              header: 'Age',
              accessor: (tx) => (
                <div className="flex flex-col">
                  <TimeAgo timestamp={tx.timestamp} className="text-gray-900 dark:text-white" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ),
            },
            {
              header: 'From',
              accessor: (tx) => (
                <div className="flex items-center group">
                  <AddressDisplay
                    address={tx.from}
                    networkType={tx.networkType}
                    truncate={true}
                    className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  />
                  <button 
                    onClick={() => copyToClipboard(tx.from)} 
                    className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
            {
              header: 'To',
              accessor: (tx) => (
                tx.to ? (
                  <div className="flex items-center group">
                    <AddressDisplay
                      address={tx.to}
                      networkType={tx.networkType}
                      truncate={true}
                      className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    />
                    <button 
                      onClick={() => copyToClipboard(tx.to)} 
                      className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md text-xs">
                    Contract Creation
                  </span>
                )
              ),
            },
            {
              header: 'Value',
              accessor: (tx) => (
                <div className="font-medium">
                  <span className="text-primary-600 dark:text-primary-400">{tx.value} SEL</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${(parseFloat(tx.value) * 0.04).toFixed(2)}
                  </div>
                </div>
              ),
            },
            {
              header: 'Type',
              accessor: (tx) => <NetworkBadge type={tx.networkType} />,
              className: 'text-center',
            },
            {
              header: 'Status',
              accessor: (tx) => <StatusBadge status={tx.status} />,
              className: 'text-center',
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
          data={data?.items || []}
          keyExtractor={(tx) => tx.id}
          isLoading={isLoading}
          emptyMessage="No transactions found."
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

export default Transactions;

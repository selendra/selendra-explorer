import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccounts } from '../contexts/ApiContext';
import DataTable from '../components/data/DataTable';
import Pagination from '../components/ui/Pagination';
import TimeAgo from '../components/ui/TimeAgo';
import NetworkBadge from '../components/ui/NetworkBadge';
import { 
  UserIcon, 
  ArrowPathIcon, 
  ChevronRightIcon, 
  IdentificationIcon, 
  DocumentDuplicateIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Accounts: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useAccounts(page, pageSize);
  
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
            <UserIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
            Accounts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Browse all accounts on the Selendra blockchain. Accounts can be either externally owned (EOA) or contract accounts.
          </p>
        </div>
        
        <button 
          className="btn-gradient self-start flex items-center px-5 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all hover:shadow-md"
          onClick={() => window.location.reload()}
          aria-label="Refresh accounts"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <IdentificationIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Total Accounts
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data ? (
              data.totalCount.toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            New accounts (24h): +125
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <UserIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            EVM Accounts
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data?.totalCount ? (
              Math.floor(data.totalCount * 0.65).toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-primary-600 dark:text-primary-400">65%</span> of total accounts
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <UserIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Wasm Accounts
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data?.totalCount ? (
              Math.floor(data.totalCount * 0.35).toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-secondary-600 dark:text-secondary-400">35%</span> of total accounts
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <IdentificationIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            Account List
          </h2>
          
          {!isLoading && data && (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
              Showing accounts {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.totalCount)} of {data.totalCount.toLocaleString()}
            </div>
          )}
        </div>
        
        <DataTable
          columns={[
            {
              header: 'Address',
              accessor: (account) => (
                <div className="flex items-center group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300 mr-3 flex-shrink-0 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <Link to={`/accounts/${account.address}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm truncate max-w-[120px] sm:max-w-[160px]">
                    {`${account.address.substring(0, 8)}...${account.address.substring(account.address.length - 6)}`}
                  </Link>
                  <button 
                    onClick={() => copyToClipboard(account.address)} 
                    className="ml-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Copy account address"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
            {
              header: 'Type',
              accessor: (account) => (
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs capitalize">
                    {account.type.replace('_', ' ')}
                  </span>
                  <NetworkBadge type={account.networkType} />
                </div>
              ),
            },
            {
              header: 'Balance',
              accessor: (account) => (
                <div className="font-medium">
                  <div className="text-primary-600 dark:text-primary-400 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    {account.balance} SEL
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${(parseFloat(account.balance) * 0.04).toFixed(2)}
                  </div>
                </div>
              ),
            },
            {
              header: 'Transactions',
              accessor: (account) => (
                <Link 
                  to={`/transactions?address=${account.address}`} 
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:underline group"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">{account.transactionCount.toLocaleString()}</span>
                  <ChevronRightIcon className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ),
            },
            {
              header: 'Created',
              accessor: (account) => (
                <div className="flex flex-col">
                  <TimeAgo timestamp={account.createdAt} className="text-gray-900 dark:text-white" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ),
            },
            {
              header: '',
              accessor: (account) => (
                <Link to={`/accounts/${account.address}`} className="flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              ),
              className: 'w-10',
            },
          ]}
          data={data?.items || []}
          keyExtractor={(account) => account.id}
          isLoading={isLoading}
          emptyMessage="No accounts found."
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

export default Accounts;

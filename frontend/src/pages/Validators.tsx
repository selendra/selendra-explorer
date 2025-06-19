import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useValidators } from '../contexts/ApiContext';
import { NetworkType } from '../types';
import DataTable from '../components/data/DataTable';
import Pagination from '../components/ui/Pagination';
import AddressDisplay from '../components/ui/AddressDisplay';
import StatusBadge from '../components/ui/StatusBadge';
import { 
  ShieldCheckIcon, 
  ArrowPathIcon, 
  ChevronRightIcon,
  CubeIcon,
  BanknotesIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const Validators: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'active' | 'waiting' | 'inactive' | undefined>(undefined);
  const pageSize = 20;
  const { data, isLoading } = useValidators(page, pageSize);
  
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
            <ShieldCheckIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
            Validators
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Browse all validators on the Selendra blockchain. Validators secure the network by staking SEL and producing blocks.
          </p>
        </div>
        
        <button 
          className="btn-gradient self-start flex items-center px-5 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all hover:shadow-md"
          onClick={() => window.location.reload()}
          aria-label="Refresh validators"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <ShieldCheckIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Active Validators
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data ? (
              (status === 'active' ? data.totalCount : Math.floor(data.totalCount * 0.6)).toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-primary-600 dark:text-primary-400">60%</span> of total validators
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <BanknotesIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Total Staked
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading ? (
              "2,345,890 SEL"
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            ≈ $93,835.60
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Total Delegators
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading ? (
              "4,325"
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Average: 22 per validator
          </div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
          Filter Validators
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setStatus(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              status === undefined
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-500'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
            }`}
          >
            All Validators
          </button>
          <button
            onClick={() => setStatus('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              status === 'active'
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-500'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatus('waiting')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              status === 'waiting'
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-500'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
            }`}
          >
            Waiting
          </button>
          <button
            onClick={() => setStatus('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              status === 'inactive'
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-500'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            {status === 'active' ? 'Active Validators' : 
             status === 'waiting' ? 'Waiting Validators' : 
             status === 'inactive' ? 'Inactive Validators' : 'All Validators'}
          </h2>
          
          {!isLoading && data && (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
              Showing validators {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.totalCount)} of {data.totalCount.toLocaleString()}
            </div>
          )}
        </div>
        
        <DataTable
          columns={[
            {
              header: 'Validator',
              accessor: (validator) => (
                <div className="flex items-center group">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 mr-3 flex items-center justify-center ${
                    validator.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : validator.status === 'waiting'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <ShieldCheckIcon className={`h-4 w-4 ${
                      validator.status === 'active' 
                        ? 'text-green-600 dark:text-green-400' 
                        : validator.status === 'waiting'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <Link to={`/validators/${validator.address}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                      {validator.name || `Validator ${validator.address.substring(0, 8)}...`}
                    </Link>
                    <div className="flex items-center">
                      <button 
                        onClick={() => copyToClipboard(validator.address)} 
                        className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100 mr-2"
                        aria-label="Copy validator address"
                      >
                        <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                      </button>
                      {validator.status === 'active' && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                          <CubeIcon className="h-3 w-3 mr-1" />
                          Last block: #{Math.floor(10000000 + Math.random() * 10000).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: 'Address',
              accessor: (validator) => (
                <div className="flex items-center group">
                  <AddressDisplay
                    address={validator.address}
                    networkType={"substrate" as NetworkType}
                    truncate={true}
                    className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  />
                  <button 
                    onClick={() => copyToClipboard(validator.address)} 
                    className="ml-1.5 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Copy validator address"
                  >
                    <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            },
            {
              header: 'Status',
              accessor: (validator) => (
                <div className="flex justify-center">
                  <StatusBadge status={validator.status} />
                </div>
              ),
              className: 'text-center',
            },
            {
              header: 'Staked',
              accessor: (validator) => (
                <div className="font-medium">
                  <div className="flex items-center text-primary-600 dark:text-primary-400">
                    <BanknotesIcon className="h-3.5 w-3.5 mr-1" />
                    {validator.totalStake} SEL
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${(parseFloat(validator.totalStake) * 0.04).toFixed(2)}
                  </div>
                </div>
              ),
            },
            {
              header: 'Commission',
              accessor: (validator) => (
                <div className="font-medium text-gray-900 dark:text-white">
                  {validator.commission}%
                </div>
              ),
            },
            {
              header: 'Uptime',
              accessor: (validator) => (
                <div className="w-full">
                  <div className="flex justify-between mb-1.5 text-xs">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{validator.uptime}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        validator.uptime > 99 
                          ? 'bg-green-500 dark:bg-green-400' 
                          : validator.uptime > 95 
                            ? 'bg-yellow-500 dark:bg-yellow-400' 
                            : 'bg-red-500 dark:bg-red-400'
                      }`}
                      style={{ width: `${validator.uptime}%` }}
                    ></div>
                  </div>
                </div>
              ),
            },
            {
              header: 'Delegators',
              accessor: (validator) => (
                <div className="flex items-center">
                  <UsersIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{validator.delegatorCount}</span>
                </div>
              ),
            },
            {
              header: 'Last Active',
              accessor: () => (
                <div className="flex items-center">
                  <ClockIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">N/A</span>
                </div>
              ),
            },
            {
              header: '',
              accessor: (validator) => (
                <Link to={`/validators/${validator.address}`} className="flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              ),
              className: 'w-10',
            },
          ]}
          data={data?.items || []}
          keyExtractor={(validator) => validator.id}
          isLoading={isLoading}
          emptyMessage="No validators found."
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

export default Validators;

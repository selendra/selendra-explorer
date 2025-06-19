import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowsRightLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { formatDistance } from 'date-fns';
import { useSubstrateExtrinsics } from '../contexts/ApiContext';
import Pagination from '../components/ui/Pagination';
import IdentityBadge from '../components/identity/IdentityBadge';
import { SubstrateExtrinsic } from '../types';

const Extrinsics: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const pageSize = 20;
  
  const { data, isLoading, error } = useSubstrateExtrinsics(page, pageSize);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;
  
  // Get unique modules and functions for filtering
  const modules = data ? Array.from(new Set(data.items.map(ex => ex.call_module))).sort() : [];
  const functions = data ? Array.from(new Set(data.items.map(ex => ex.call_function))).sort() : [];
  
  // Filter extrinsics based on selected module and function
  const filteredExtrinsics = data?.items.filter(ex => {
    if (selectedModule && ex.call_module !== selectedModule) return false;
    if (selectedFunction && ex.call_function !== selectedFunction) return false;
    return true;
  }) || [];

  // Helper to create unique key for extrinsic
  const getExtrinsicKey = (extrinsic: SubstrateExtrinsic) => 
    `${extrinsic.block_number}-${extrinsic.extrinsic_index}`;

  // Helper to create extrinsic ID for display
  const getExtrinsicId = (extrinsic: SubstrateExtrinsic) => 
    `${extrinsic.block_number}-${extrinsic.extrinsic_index}`;

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error Loading Extrinsics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <ArrowsRightLeftIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
            Substrate Extrinsics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and explore Substrate extrinsics on the Selendra blockchain
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
            Filters
          </button>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Module
            </label>
            <select
              value={selectedModule || ''}
              onChange={(e) => setSelectedModule(e.target.value || null)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm w-40"
            >
              <option value="">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Function
            </label>
            <select
              value={selectedFunction || ''}
              onChange={(e) => setSelectedFunction(e.target.value || null)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm w-48"
            >
              <option value="">All Functions</option>
              {functions.map(func => (
                <option key={func} value={func}>{func}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Extrinsics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Extrinsic ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Block
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Signer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Signed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                  </tr>
                ))
              ) : filteredExtrinsics.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <ArrowsRightLeftIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No extrinsics found</p>
                      <p className="text-sm">Try adjusting your filters or check back later.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExtrinsics.map((extrinsic) => (
                  <tr key={getExtrinsicKey(extrinsic)} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/extrinsics/${extrinsic.block_number}-${extrinsic.extrinsic_index}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm"
                      >
                        {getExtrinsicId(extrinsic)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/blocks/${extrinsic.block_number}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {extrinsic.block_number.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDistance(new Date(extrinsic.timestamp), new Date(), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {extrinsic.call_module}.{extrinsic.call_function}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {extrinsic.signer ? (
                        <IdentityBadge 
                          address={extrinsic.signer} 
                          showFullInfo={false}
                        />
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Unsigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        extrinsic.is_signed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {extrinsic.is_signed ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                            Signed
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-4 w-4 mr-1.5" />
                            Unsigned
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.totalCount > pageSize && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((page - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * pageSize, data.totalCount)}</span> of{' '}
                  <span className="font-medium">{data.totalCount.toLocaleString()}</span> extrinsics
                </p>
              </div>
              <div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Extrinsics; 
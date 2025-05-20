import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlocks } from '../contexts/ApiContext';
import DataTable from '../components/data/DataTable';
import Pagination from '../components/ui/Pagination';
import TimeAgo from '../components/ui/TimeAgo';
import NetworkBadge from '../components/ui/NetworkBadge';
import { CubeIcon, ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Blocks: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useBlocks(page, pageSize);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <CubeIcon className="h-7 w-7 mr-3 text-primary-500 dark:text-primary-400" />
            Blocks
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">
            Browse all blocks on the Selendra blockchain. A block is a batch of transactions that have been verified and added to the blockchain.
          </p>
        </div>
        
        <button 
          className="btn btn-primary self-start flex items-center"
          onClick={() => window.location.reload()}
          aria-label="Refresh blocks"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Latest Block</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data?.items[0] ? (
              <Link to={`/blocks/${data.items[0].number}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {data.items[0].number.toLocaleString()}
              </Link>
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Blocks</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && data ? (
              data.totalCount.toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Block Time</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading ? "~6.5 seconds" : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <CubeIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            Recent Blocks
          </h2>
          
          {!isLoading && data && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing blocks {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.totalCount)} of {data.totalCount.toLocaleString()}
            </div>
          )}
        </div>
        
        <DataTable
          columns={[
            {
              header: 'Block',
              accessor: (block) => (
                <Link to={`/blocks/${block.number}`} className="flex items-center text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  <CubeIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  {block.number.toLocaleString()}
                </Link>
              ),
            },
            {
              header: 'Age',
              accessor: (block) => (
                <div className="flex flex-col">
                  <TimeAgo timestamp={block.timestamp} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(block.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ),
            },
            {
              header: 'Transactions',
              accessor: (block) => (
                <div className="font-medium">
                  {block.transactionCount > 0 ? (
                    <span className="text-primary-600 dark:text-primary-400">{block.transactionCount}</span>
                  ) : (
                    <span className="text-gray-500">0</span>
                  )}
                </div>
              ),
            },
            {
              header: 'Size',
              accessor: (block) => (
                <div className="flex flex-col">
                  <span className="font-medium">{(block.size / 1024).toFixed(2)} KB</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {block.size.toLocaleString()} bytes
                  </span>
                </div>
              ),
            },
            {
              header: 'Gas Used',
              accessor: (block) => (
                <div className="flex flex-col">
                  <span className="font-medium">{parseInt(block.gasUsed).toLocaleString()}</span>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1.5">
                    <div 
                      className="bg-primary-500 dark:bg-primary-400 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, parseInt(block.gasUsed) / parseInt(block.gasLimit) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ),
            },
            {
              header: 'Validator',
              accessor: (block) => (
                <Link to={`/accounts/${block.miner}`} className="flex items-center text-primary-600 dark:text-primary-400 hover:underline font-mono group">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-300 to-secondary-300 mr-2 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  {`${block.miner.substring(0, 6)}...${block.miner.substring(block.miner.length - 4)}`}
                </Link>
              ),
            },
            {
              header: 'Type',
              accessor: (block) => <NetworkBadge type={block.networkType} />,
              className: 'text-center',
            },
            {
              header: '',
              accessor: (block) => (
                <Link to={`/blocks/${block.number}`} className="flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              ),
              className: 'w-10',
            },
          ]}
          data={data?.items || []}
          keyExtractor={(block) => block.id}
          isLoading={isLoading}
          emptyMessage="No blocks found."
          loadingRows={10}
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

export default Blocks;

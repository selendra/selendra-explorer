import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApi, Transaction } from '../contexts/ApiContext';

const Transactions: React.FC = () => {
  const api = useApi();
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Get filter parameters from URL
  const addressFilter = searchParams.get('address');
  const blockFilter = searchParams.get('block');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await api.getTransactions(page, 20, addressFilter || undefined);
        setTransactions(response.transactions);
        setTotalPages(Math.ceil(response.total / response.page_size));
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [api, page, addressFilter, blockFilter]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {addressFilter 
          ? `Transactions for ${formatAddress(addressFilter)}`
          : blockFilter
            ? `Transactions for Block #${blockFilter}`
            : 'Transactions'
        }
      </h1>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hash
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Block
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    From
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/transactions/${tx.hash}`} className="text-primary-600 hover:text-primary-900">
                        {formatAddress(tx.hash)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/blocks/${tx.block_number}`} className="text-primary-600 hover:text-primary-900">
                        {tx.block_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(tx.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/accounts/${tx.from_address}`} className="text-primary-600 hover:text-primary-900">
                        {formatAddress(tx.from_address)}
                      </Link>
                      {addressFilter && tx.from_address.toLowerCase() === addressFilter.toLowerCase() && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">OUT</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.to_address ? (
                        <Link to={`/accounts/${tx.to_address}`} className="text-primary-600 hover:text-primary-900">
                          {formatAddress(tx.to_address)}
                        </Link>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Contract Creation</span>
                      )}
                      {addressFilter && tx.to_address && tx.to_address.toLowerCase() === addressFilter.toLowerCase() && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">IN</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {parseFloat(tx.value) > 0 ? `${parseFloat(tx.value).toFixed(4)} SEL` : '0 SEL'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tx.execution_type === 'evm' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {tx.execution_type.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className={`btn ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'btn-outline'}`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className={`btn ${page === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'btn-outline'}`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Transactions;

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi, Block, Transaction } from '../contexts/ApiContext';

const BlockDetails: React.FC = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const api = useApi();
  const [block, setBlock] = useState<Block | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockData = async () => {
      if (!blockId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch block details
        const blockData = await api.getBlock(blockId);
        setBlock(blockData);
        
        // Fetch transactions for this block
        const txResponse = await api.getTransactions(1, 100, undefined, blockData.number);
        setTransactions(txResponse.transactions);
      } catch (err) {
        console.error('Failed to fetch block details:', err);
        setError('Failed to load block details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockData();
  }, [api, blockId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link to="/blocks" className="btn btn-primary">
          Back to Blocks
        </Link>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="text-center py-12">
        <div className="text-xl mb-4">Block not found</div>
        <Link to="/blocks" className="btn btn-primary">
          Back to Blocks
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Block #{block.number}</h1>

      {/* Block Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Block Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Block Hash</p>
            <p className="font-mono break-all">{block.hash}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Timestamp</p>
            <p>{formatTimestamp(block.timestamp)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Parent Hash</p>
            <Link to={`/blocks/${block.number - 1}`} className="font-mono break-all text-primary-600 hover:text-primary-900">
              {block.parent_hash}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Author</p>
            <p>{block.author ? (
              <Link to={`/accounts/${block.author}`} className="text-primary-600 hover:text-primary-900">
                {block.author}
              </Link>
            ) : 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gas Used</p>
            <p>{block.gas_used.toLocaleString()} ({((block.gas_used / block.gas_limit) * 100).toFixed(2)}%)</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gas Limit</p>
            <p>{block.gas_limit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Size</p>
            <p>{block.size ? `${block.size.toLocaleString()} bytes` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transactions</p>
            <p>{block.transaction_count}</p>
          </div>
          {block.consensus_engine && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Consensus Engine</p>
              <p>{block.consensus_engine}</p>
            </div>
          )}
          {block.finalized !== undefined && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Finalized</p>
              <p>{block.finalized ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Transactions ({block.transaction_count})</h2>
        
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hash
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
                      <Link to={`/accounts/${tx.from_address}`} className="text-primary-600 hover:text-primary-900">
                        {formatAddress(tx.from_address)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.to_address ? (
                        <Link to={`/accounts/${tx.to_address}`} className="text-primary-600 hover:text-primary-900">
                          {formatAddress(tx.to_address)}
                        </Link>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Contract Creation</span>
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
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No transactions in this block.
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockDetails;

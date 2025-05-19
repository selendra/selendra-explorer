import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useApi, Transaction } from '../contexts/ApiContext';

const MyAccount: React.FC = () => {
  const { isConnected, address, walletType, balance } = useWallet();
  const api = useApi();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accountDetails, setAccountDetails] = useState<any>(null);

  // Redirect if not connected
  if (!isConnected || !address) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        
        // Fetch account details
        const accountData = await api.getAccount(address);
        setAccountDetails(accountData);
        
        // Fetch transactions for this address
        const txResponse = await api.getTransactions(1, 10, address);
        setTransactions(txResponse.transactions);
      } catch (error) {
        console.error('Failed to fetch account data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address, api]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      {/* Account Overview */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Account Overview</h2>
            <p className="text-gray-600 dark:text-gray-400 break-all">{address}</p>
            <p className="mt-2">
              <span className="text-gray-600 dark:text-gray-400">Wallet Type:</span>{' '}
              <span className="font-medium">{walletType === 'evm' ? 'EVM (MetaMask)' : 'Substrate (Polkadot.js)'}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:text-right">
            <p className="text-gray-600 dark:text-gray-400">Balance</p>
            <p className="text-2xl font-bold text-primary-600">
              {balance ? `${parseFloat(balance).toFixed(4)} SEL` : 'Loading...'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse mt-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          </div>
        ) : accountDetails ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-xl font-semibold">{accountDetails.transaction_count}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-gray-600 dark:text-gray-400">Nonce</p>
              <p className="text-xl font-semibold">{accountDetails.nonce}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-gray-600 dark:text-gray-400">Contract</p>
              <p className="text-xl font-semibold">{accountDetails.is_contract ? 'Yes' : 'No'}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/my-assets" className="btn btn-primary">
            View Assets
          </Link>
          <Link to="/my-staking" className="btn btn-secondary">
            Staking Dashboard
          </Link>
          <Link to="/my-contracts" className="btn btn-outline">
            My Contracts
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link to={`/transactions?address=${address}`} className="text-primary-600 hover:text-primary-700 text-sm">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
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
                    From
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/transactions/${tx.hash}`} className="text-primary-600 hover:text-primary-700">
                        {formatAddress(tx.hash)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/blocks/${tx.block_number}`} className="text-primary-600 hover:text-primary-700">
                        {tx.block_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/accounts/${tx.from_address}`} className="text-primary-600 hover:text-primary-700">
                        {formatAddress(tx.from_address)}
                      </Link>
                      {tx.from_address.toLowerCase() === address.toLowerCase() && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">OUT</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.to_address ? (
                        <Link to={`/accounts/${tx.to_address}`} className="text-primary-600 hover:text-primary-700">
                          {formatAddress(tx.to_address)}
                        </Link>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Contract Creation</span>
                      )}
                      {tx.to_address && tx.to_address.toLowerCase() === address.toLowerCase() && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">IN</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {parseFloat(tx.value) > 0 ? `${parseFloat(tx.value).toFixed(4)} SEL` : '0 SEL'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(tx.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No transactions found for this address.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;

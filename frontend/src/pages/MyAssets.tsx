import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const MyAssets: React.FC = () => {
  const { isConnected, address, assets, isLoading } = useWallet();

  // Redirect if not connected
  if (!isConnected || !address) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Assets</h1>

      {/* Assets Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Assets Overview</h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : assets && assets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value (USD)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {assets.map((asset, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">
                            {asset.name || asset.symbol || 'Unknown Asset'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.asset_type === 'native' ? 'Native Token' : asset.asset_address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {asset.balance} {asset.symbol || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        ${asset.value_usd ? asset.value_usd.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Send
                      </button>
                      <button className="text-secondary-600 hover:text-secondary-900">
                        Receive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No assets found for this address.
          </div>
        )}
      </div>

      {/* Token Transfer Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Transfer Tokens</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="asset" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Asset
            </label>
            <select
              id="asset"
              name="asset"
              className="input"
              defaultValue=""
            >
              <option value="" disabled>Select an asset</option>
              {assets?.map((asset, index) => (
                <option key={index} value={asset.asset_address || 'native'}>
                  {asset.name || asset.symbol || 'Unknown Asset'} ({asset.balance})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              placeholder="Enter recipient address"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder="0.0"
              min="0"
              step="0.000001"
              className="input"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Send Tokens
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyAssets;

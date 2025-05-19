import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const MyStaking: React.FC = () => {
  const { isConnected, address, stakings, isLoading } = useWallet();

  // Redirect if not connected
  if (!isConnected || !address) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Staking</h1>

      {/* Staking Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Staking Overview</h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : stakings && stakings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Validator
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estimated Rewards
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stakings.map((staking, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">
                            {staking.validator_name || 'Unknown Validator'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {staking.validator_address.slice(0, 8)}...{staking.validator_address.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {staking.amount} SEL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        staking.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : staking.status === 'unbonding' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staking.status.charAt(0).toUpperCase() + staking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {staking.estimated_rewards} SEL
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Commission: {(staking.commission_rate || 0) * 100}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Claim
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Unbond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No staking positions found for this address.
          </div>
        )}
      </div>

      {/* Staking Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Stake Tokens</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="validator" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Validator
            </label>
            <select
              id="validator"
              name="validator"
              className="input"
              defaultValue=""
            >
              <option value="" disabled>Select a validator</option>
              <option value="validator1">Validator 1 (Commission: 5%)</option>
              <option value="validator2">Validator 2 (Commission: 7%)</option>
              <option value="validator3">Validator 3 (Commission: 3%)</option>
            </select>
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
          <div>
            <label htmlFor="reward_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reward Address (Optional)
            </label>
            <input
              type="text"
              id="reward_address"
              name="reward_address"
              placeholder="Enter reward address or leave empty to use staking address"
              className="input"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Stake Tokens
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyStaking;

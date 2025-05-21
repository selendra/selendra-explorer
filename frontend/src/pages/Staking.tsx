import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useValidators } from '../contexts/ApiContext';
import DataTable from '../components/data/DataTable';
import AddressDisplay from '../components/ui/AddressDisplay';
import LineChart from '../components/charts/LineChart';
import { 
  ShieldCheckIcon, 
  ChevronRightIcon,
  BanknotesIcon,
  UsersIcon,
  PlusCircleIcon,
  WalletIcon,
  ChartBarIcon,
  TrophyIcon,
  CalculatorIcon,
  ClockIcon,
  ArrowUpCircleIcon
} from '@heroicons/react/24/outline';

const StakingChart: React.FC = () => {
  // Mock data for staking rewards over time
  const mockData = {
    labels: ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12', 'Feb 19', 'Feb 26', 'Mar 5', 'Mar 12', 'Mar 19'],
    datasets: [
      {
        label: 'Daily Rewards',
        data: [0.2, 0.22, 0.21, 0.25, 0.3, 0.28, 0.35, 0.38, 0.42, 0.4, 0.43, 0.42],
        borderColor: '#8C30F5',
        backgroundColor: '#8C30F5',
      },
      {
        label: 'Total Staked',
        data: [100, 110, 115, 118, 120, 125, 125, 125, 125.5, 125.5, 125.5, 125.5],
        borderColor: '#0CCBD6',
        backgroundColor: '#0CCBD6',
      }
    ]
  };

  return <LineChart data={mockData} height={250} animated={true} />;
};

interface StakingFormProps {
  onClose: () => void;
}

const StakingForm: React.FC<StakingFormProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [validator, setValidator] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      onClose();
      // Mock success notification would go here
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stake SEL</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stake Amount (SEL)
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="number"
              min="1"
              step="0.1"
              placeholder="Enter amount to stake"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full pr-12 border-gray-300 dark:border-gray-600 rounded-md 
                         focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 
                         dark:text-white text-sm p-3"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">SEL</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Available: 125.5 SEL
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Validator
          </label>
          <select
            value={validator}
            onChange={(e) => setValidator(e.target.value)}
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md 
                       focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 
                       dark:text-white text-sm p-3"
            required
          >
            <option value="">Select a validator</option>
            <option value="validator1">Validator One (Commission: 2%)</option>
            <option value="validator2">Validator Two (Commission: 3%)</option>
            <option value="validator3">Validator Three (Commission: 1.5%)</option>
            <option value="validator4">Validator Four (Commission: 2.5%)</option>
          </select>
        </div>
        
        <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Staking Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Estimated APY:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">8-12%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Unbonding Period:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">7 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Rewards Distribution:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Every epoch (24h)</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !amount || !validator}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 
                     text-white font-medium py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 
                     disabled:cursor-not-allowed disabled:hover:from-primary-500 disabled:hover:to-secondary-500"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Stake SEL'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const Staking: React.FC = () => {
  const [showStakingForm, setShowStakingForm] = useState(false);
  const pageSize = 10;
  const { data, isLoading } = useValidators(1, pageSize, 'active');
  
  // Mock user staking data
  const userStaking = {
    totalStaked: '125.5',
    estimatedRewards: '0.42',
    estimatedApy: '9.8',
    validators: [
      { 
        name: 'Validator One', 
        address: '0x1234...5678', 
        amount: '75.5', 
        rewards: '0.25',
        claimable: true
      },
      { 
        name: 'Validator Two', 
        address: '0x8765...4321', 
        amount: '50.0', 
        rewards: '0.17',
        claimable: true
      }
    ]
  };

  const totalAvailableRewards = userStaking.validators.reduce(
    (total, validator) => total + parseFloat(validator.rewards),
    0
  ).toFixed(2);
  
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-50/80 via-white to-secondary-50/80 dark:from-primary-900/20 dark:via-gray-900 dark:to-secondary-900/20 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 dark:from-primary-500/10 dark:to-secondary-500/10"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <ShieldCheckIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
              Staking Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Stake your SEL tokens to earn rewards and help secure the Selendra network. Earn up to 12% APY by nominating validators.
            </p>
            
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/60 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Network Staked</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  75.5M <span className="text-base ml-1">SEL</span>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Validators</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">128</div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 sm:col-span-1 col-span-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Current APY</div>
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">8%-12%</div>
              </div>
            </div>
          </div>
          
          <button 
            className="btn-gradient self-start flex items-center px-5 py-3 rounded-lg shadow-md text-white font-medium transition-all hover:shadow-lg hover:scale-105 transform"
            onClick={() => setShowStakingForm(true)}
            aria-label="Stake SEL"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Stake SEL
          </button>
        </div>
      </div>
      
      {/* Staking Modal */}
      {showStakingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <StakingForm onClose={() => setShowStakingForm(false)} />
        </div>
      )}
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-4">
              <WalletIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Staked</div>
              <div className="flex items-center mt-1">
                <img src="/sel/coin.png" alt="SEL" className="w-5 h-5 mr-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{userStaking.totalStaked}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ≈ ${(parseFloat(userStaking.totalStaked) * 0.04).toFixed(2)} USD
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
              <BanknotesIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Daily Rewards</div>
              <div className="flex items-center mt-1">
                <img src="/sel/coin.png" alt="SEL" className="w-5 h-5 mr-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{userStaking.estimatedRewards}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ≈ ${(parseFloat(userStaking.estimatedRewards) * 0.04).toFixed(2)} USD
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
              <CalculatorIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Estimated APY</div>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{userStaking.estimatedApy}%</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Based on current network conditions
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
              <TrophyIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Available Rewards</div>
              <div className="flex items-center mt-1">
                <img src="/sel/coin.png" alt="SEL" className="w-5 h-5 mr-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{totalAvailableRewards}</span>
              </div>
            </div>
          </div>
          <button 
            className="mt-1 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center"
          >
            Claim All <ArrowUpCircleIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
      
      {/* My Staking Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <WalletIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            My Staking Positions
          </h2>
        </div>

        {userStaking.validators.length > 0 ? (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              My Active Nominations
            </h3>
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
                      Rewards
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {userStaking.validators.map((val, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                            <ShieldCheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{val.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{val.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src="/sel/coin.png" alt="SEL" className="w-4 h-4 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{val.amount}</div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">≈ ${(parseFloat(val.amount) * 0.04).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src="/sel/coin.png" alt="SEL" className="w-4 h-4 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{val.rewards}</div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">≈ ${(parseFloat(val.rewards) * 0.04).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          {val.claimable && (
                            <button className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-md">
                              Claim
                            </button>
                          )}
                          <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-md">
                            Unstake
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any active nominations.</p>
            <button 
              className="btn-gradient inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-white font-medium"
              onClick={() => setShowStakingForm(true)}
            >
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Stake Now
            </button>
          </div>
        )}
        
        {/* Staking Rewards Chart */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            Staking Rewards History
          </h3>
          <StakingChart />
        </div>
      </div>
      
      {/* Validators Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            Active Validators
          </h2>
          <Link 
            to="/validators" 
            className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            View All Validators
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {!isLoading && data?.items ? (
            <DataTable 
              columns={[
                {
                  header: 'Validator',
                  accessor: (validator) => (
                    <div className="flex items-center">
                      <div className={`w-8 h-8 ${validator.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} rounded-full flex items-center justify-center mr-3`}>
                        <ShieldCheckIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {validator.name || `Validator ${validator.id.substring(0, 6)}`} 
                          {Number(validator.selfStake) > 100000 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                              <TrophyIcon className="h-3 w-3 mr-1" />
                              Top Validator
                            </span>
                          )}
                        </div>
                        <AddressDisplay 
                          address={validator.address}
                          networkType="evm"
                          truncate={true}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  header: 'Staked Amount',
                  accessor: (validator) => (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center">
                        <img src="/sel/coin.png" alt="SEL" className="w-4 h-4 mr-2" />
                        {Number(validator.totalStake).toLocaleString()} SEL
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ${(Number(validator.totalStake) * 0.04).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                  header: 'Nominators',
                  accessor: (validator) => (
                    <Link 
                      to={`/validators/${validator.address}`} 
                      className="font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                    >
                      <UsersIcon className="h-4 w-4 mr-1.5" />
                      {validator.delegatorCount}
                    </Link>
                  ),
                },
                {
                  header: '',
                  accessor: () => (
                    <div className="flex justify-end">
                      <button 
                        onClick={() => {
                          setShowStakingForm(true);
                          // In a real app, we'd pre-select this validator
                        }}
                        className="text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:opacity-90 px-3 py-1.5 rounded-md text-sm font-medium flex items-center"
                      >
                        <PlusCircleIcon className="h-4 w-4 mr-1.5" />
                        Stake
                      </button>
                    </div>
                  ),
                },
              ]}
              data={data.items}
              keyExtractor={(validator) => validator.id}
              isLoading={isLoading}
              emptyMessage="No validators found."
            />
          ) : (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Staking Guide */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            Staking Timeline
          </h2>
        </div>
        
        <div className="p-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute top-0 left-9 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            <div className="space-y-8">
              <div className="relative flex items-start">
                <div className="flex items-center justify-center h-18 w-18">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center z-10">
                    <span className="text-sm font-semibold">1</span>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Choose Validators</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                    Select validators with a good reputation, reasonable commission rates, and strong track records. Diversifying your nominations can reduce risk.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center justify-center h-18 w-18">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center z-10">
                    <span className="text-sm font-semibold">2</span>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Stake Your SEL</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                    Stake your SEL tokens to one or more validators. Your stake will be active in the next era after nomination.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center justify-center h-18 w-18">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center z-10">
                    <span className="text-sm font-semibold">3</span>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Earn Rewards</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                    Rewards are distributed at the end of each era (24 hours). You can claim rewards at any time.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center justify-center h-18 w-18">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center z-10">
                    <span className="text-sm font-semibold">4</span>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Unstake When Ready</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                    When you want to access your funds, you can unstake. There is a 7-day unbonding period before your tokens are liquid again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clean export without trailing whitespace or extra characters
const StakingPage = Staking;
export { StakingPage as Staking };
export default StakingPage; 
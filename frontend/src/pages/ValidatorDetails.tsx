import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useValidator } from '../contexts/ApiContext';
import AddressDisplay from '../components/ui/AddressDisplay';
import StatusBadge from '../components/ui/StatusBadge';
import LineChart from '../components/charts/LineChart';

// Mock data for the charts
const generateValidatorPerformanceData = () => {
  const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  const blocksProducedData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 50);
  const rewardPointsData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5000) + 1000);
  
  return {
    labels,
    datasets: [
      {
        label: 'Blocks Produced',
        data: blocksProducedData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Reward Points',
        data: rewardPointsData,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };
};

const ValidatorDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { data: validator, isLoading, error } = useValidator(address || '');
  
  const performanceChartData = generateValidatorPerformanceData();
  const performanceChartOptions = {
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Blocks Produced',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Reward Points',
        },
      },
    },
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  if (error || !validator) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Validator Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          The validator you are looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/validators"
          className="mt-6 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View All Validators
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {validator.name || 'Validator'}
          </h1>
          <StatusBadge status={validator.status} />
        </div>
      </div>
      
      {/* Validator Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Validator Overview</h2>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Address</div>
            <AddressDisplay
              address={validator.address}
              networkType="wasm"
              truncate={false}
              className="text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Stake</div>
              <div className="font-medium">{parseInt(validator.totalStake).toLocaleString()} SEL</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Self Stake</div>
              <div className="font-medium">{parseInt(validator.selfStake).toLocaleString()} SEL</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Commission</div>
              <div className="font-medium">{validator.commission}%</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Delegators</div>
              <div className="font-medium">{validator.delegatorCount.toLocaleString()}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Blocks Produced</div>
              <div className="font-medium">{validator.blocksProduced.toLocaleString()}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Reward Points</div>
              <div className="font-medium">{validator.rewardPoints.toLocaleString()}</div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Uptime</div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mr-2">
                <div
                  className="bg-green-600 h-4 rounded-full"
                  style={{ width: `${validator.uptime}%` }}
                ></div>
              </div>
              <span className="font-medium">{validator.uptime.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Chart */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Performance History</h2>
        <LineChart
          data={performanceChartData}
          options={performanceChartOptions}
          height={300}
        />
        <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Note: This is simulated data for demonstration methods.
        </div>
      </div>
      
      {/* Staking Calculator */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Staking Calculator</h2>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Calculate potential staking rewards based on the amount you want to stake with this validator.
          </p>
          
          <div className="mb-4">
            <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stake Amount (SEL)
            </label>
            <input
              type="number"
              id="stake-amount"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter amount to stake"
              defaultValue="1000"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400">Daily Reward (Est.)</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">0.27 SEL</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Reward (Est.)</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">8.22 SEL</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400">Annual Yield (Est.)</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">10.04%</div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Connect Wallet to Stake
            </button>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            Note: This is a simulation. Actual rewards may vary based on network conditions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorDetails;

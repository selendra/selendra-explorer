import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts: React.FC = () => {
  const [activeTimeRange, setActiveTimeRange] = useState<string>('all');
  const [chartLoaded, setChartLoaded] = useState(false);
  const [selectedChart, setSelectedChart] = useState<number | null>(null);

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Sample data for transaction chart
  const transactionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Transactions',
        data: [6500, 5900, 8000, 8100, 9600, 8800, 10200, 11500, 10300, 12500, 11000, 13200],
        borderColor: 'rgb(140, 48, 245)',
        backgroundColor: 'rgba(140, 48, 245, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Sample data for gas usage chart
  const gasUsageData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Gas Used (in millions)',
        data: [12.3, 19.4, 15.2, 21.5, 18.7, 24.2],
        backgroundColor: 'rgba(12, 203, 214, 0.8)',
        borderColor: 'rgb(12, 203, 214)',
        borderWidth: 1,
      },
    ],
  };

  // Sample data for contract type distribution
  const contractTypeData = {
    labels: ['EVM Contracts', 'Wasm Contracts'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: [
          'rgba(140, 48, 245, 0.8)',
          'rgba(12, 203, 214, 0.8)',
        ],
        borderColor: [
          'rgb(140, 48, 245)',
          'rgb(12, 203, 214)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Sample data for token distribution
  const tokenDistributionData = {
    labels: ['SEL', 'USDT', 'USDC', 'BTC', 'ETH', 'Others'],
    datasets: [
      {
        data: [40, 20, 15, 10, 8, 7],
        backgroundColor: [
          'rgba(140, 48, 245, 0.8)',
          'rgba(12, 203, 214, 0.8)',
          'rgba(26, 35, 126, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(140, 48, 245)',
          'rgb(12, 203, 214)',
          'rgb(26, 35, 126)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setChartLoaded(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleTimeRangeChange = (range: string) => {
    setChartLoaded(false);
    setActiveTimeRange(range);
    
    // Simulate data reload
    setTimeout(() => {
      setChartLoaded(true);
    }, 500);
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="container mx-auto px-4 py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
          Charts & Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Visual analytics and insights about the Selendra blockchain network
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap items-center justify-between border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-4">Time Range:</h3>
          <div className="flex space-x-2">
            {['24h', '7d', '30d', '90d', '1y', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTimeRange === range
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 mr-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2,543,071</p>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
              <span>+5.7% from last month</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="rounded-full bg-secondary-100 dark:bg-secondary-900/30 p-3 mr-4">
                <svg className="w-6 h-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Contracts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">15,432</p>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
              <span>+3.2% from last month</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="rounded-full bg-success-100 dark:bg-success-900/30 p-3 mr-4">
                <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">SEL Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.0123</p>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
              <span>+2.5% in 24h</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="rounded-full bg-warning-100 dark:bg-warning-900/30 p-3 mr-4">
                <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg TPS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12.5</p>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
              <span>+1.8% from last week</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"
      >
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          onClick={() => setSelectedChart(selectedChart === 1 ? null : 1)}
          className={`cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 ${selectedChart === 1 ? 'ring-2 ring-primary-500' : ''}`}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
            <span>Monthly Transactions</span>
            {!chartLoaded && (
              <span className="inline-block w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></span>
            )}
          </h2>
          <div className={`h-80 transition-opacity duration-300 ${chartLoaded ? 'opacity-100' : 'opacity-40'}`}>
            <Line
              data={transactionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                    }
                  },
                  x: {
                    grid: {
                      color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                    }
                  }
                },
              }}
            />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          onClick={() => setSelectedChart(selectedChart === 2 ? null : 2)}
          className={`cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 ${selectedChart === 2 ? 'ring-2 ring-secondary-500' : ''}`}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
            <span>Weekly Gas Usage</span>
            {!chartLoaded && (
              <span className="inline-block w-5 h-5 rounded-full border-2 border-secondary-500 border-t-transparent animate-spin"></span>
            )}
          </h2>
          <div className={`h-80 transition-opacity duration-300 ${chartLoaded ? 'opacity-100' : 'opacity-40'}`}>
            <Bar
              data={gasUsageData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                    }
                  },
                  x: {
                    grid: {
                      color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                    }
                  }
                },
              }}
            />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          onClick={() => setSelectedChart(selectedChart === 3 ? null : 3)}
          className={`cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 ${selectedChart === 3 ? 'ring-2 ring-primary-500' : ''}`}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
            <span>Contract Type Distribution</span>
            {!chartLoaded && (
              <span className="inline-block w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></span>
            )}
          </h2>
          <div className={`h-80 flex items-center justify-center transition-opacity duration-300 ${chartLoaded ? 'opacity-100' : 'opacity-40'}`}>
            <div className="w-3/4 h-3/4">
              <Doughnut
                data={contractTypeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          onClick={() => setSelectedChart(selectedChart === 4 ? null : 4)}
          className={`cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 ${selectedChart === 4 ? 'ring-2 ring-secondary-500' : ''}`}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
            <span>Token Distribution</span>
            {!chartLoaded && (
              <span className="inline-block w-5 h-5 rounded-full border-2 border-secondary-500 border-t-transparent animate-spin"></span>
            )}
          </h2>
          <div className={`h-80 flex items-center justify-center transition-opacity duration-300 ${chartLoaded ? 'opacity-100' : 'opacity-40'}`}>
            <div className="w-3/4 h-3/4">
              <Doughnut
                data={tokenDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Additional Stats Table */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Blockchain Network Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Metric</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change (24h)</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { metric: 'Block Height', value: '3,456,789', change: '+12,160 blocks', key: 1 },
                { metric: 'Market Cap', value: '$12.5M', change: '+2.5%', key: 2 },
                { metric: 'Validators', value: '150', change: '+2 new', key: 3 },
                { metric: 'Average Block Time', value: '6.2 seconds', change: '-0.3s', key: 4 },
                { metric: 'Total Value Locked', value: '$45.7M', change: '+3.1%', key: 5 }
              ].map((item) => (
                <motion.tr 
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: item.key * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.metric}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{item.change}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Charts; 
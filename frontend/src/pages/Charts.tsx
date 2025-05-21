import React, { useState } from "react";
import {
  ChartBarIcon,
  ArrowsRightLeftIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import LineChart from "../components/charts/LineChart";

/**
 * Generates chart data with consistent formatting
 * @param label Chart label
 * @param color Primary color (hex)
 * @param min Minimum random value
 * @param max Maximum random value
 * @returns Formatted chart data object
 */
const generateChartData = (
  label: string,
  color: string,
  min: number,
  max: number
) => {
  const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  const data = Array.from(
    { length: 30 },
    () => Math.floor(Math.random() * (max - min)) + min
  );

  return {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}33`, // Add 20% opacity
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };
};

// Generate data for each chart type
const transactionData = generateChartData(
  "Transactions",
  "#8C30F5",
  1000,
  5000
);
const blockTimeData = generateChartData(
  "Block Time (seconds)",
  "#0CCBD6",
  4,
  6
);
const gasUsageData = generateChartData("Gas Used", "#FF6B6B", 2000000, 8000000);
const validatorData = generateChartData(
  "Active Validators",
  "#4CAF50",
  95,
  120
);

const Charts: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">(
    "30d"
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
          Charts & Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          Visualize blockchain activity and metrics on the Selendra network
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setTimeRange("24h")}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              timeRange === "24h"
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            24H
          </button>
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-4 py-2 text-sm font-medium border-l border-gray-200 dark:border-gray-700 ${
              timeRange === "7d"
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-4 py-2 text-sm font-medium border-l border-gray-200 dark:border-gray-700 ${
              timeRange === "30d"
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeRange("90d")}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border-l border-gray-200 dark:border-gray-700 ${
              timeRange === "90d"
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            90D
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-2">
            <ArrowsRightLeftIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Transactions
            </h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              1,230,495
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              <span className="mr-1">↑</span> 12.5% from previous period
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Avg: 42,344 per day
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-2">
            <CubeIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Blocks
            </h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              8,293,651
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
              <span className="mr-1">→</span> 0.2% from previous period
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Avg: 6 seconds per block
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Gas Price
            </h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              1.23 Gwei
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
              <span className="mr-1">↓</span> 8.3% from previous period
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Avg: 1.45 Gwei over 30 days
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-2">
            <ServerIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Validators
            </h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              108
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              <span className="mr-1">↑</span> 3.8% from previous period
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Total Stake: 394,799,619 SEL
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ArrowsRightLeftIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Transaction Volume
              </h3>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Last updated: 10 minutes ago
            </div>
          </div>
          <div className="h-64">
            <LineChart data={transactionData} animated={true} height={250} />
          </div>
        </div>

        {/* Block Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CubeIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Block Time
              </h3>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Last updated: 10 minutes ago
            </div>
          </div>
          <div className="h-64">
            <LineChart data={blockTimeData} animated={true} height={250} />
          </div>
        </div>

        {/* Gas Usage Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Gas Usage
              </h3>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Last updated: 10 minutes ago
            </div>
          </div>
          <div className="h-64">
            <LineChart data={gasUsageData} animated={true} height={250} />
          </div>
        </div>

        {/* Validator Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ServerIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">
                Active Validators
              </h3>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Last updated: 10 minutes ago
            </div>
          </div>
          <div className="h-64">
            <LineChart data={validatorData} animated={true} height={250} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;

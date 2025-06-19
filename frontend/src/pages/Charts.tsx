import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ArrowsRightLeftIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import ModernLineChart from "../components/charts/ModernLineChart";
import { chartApiService, type NetworkStatsData } from "../services/chartApi";

const Charts: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("30d");
  const [networkStats, setNetworkStats] = useState<NetworkStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch network stats data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await chartApiService.getNetworkStatsData(timeRange);
        setNetworkStats(data);
      } catch (err) {
        console.error("Error fetching network stats:", err);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Convert chart data to Recharts format
  const convertToChartData = (data: any[]) => {
    return data.map((point, index) => {
      let name: string;
      if (timeRange === "24h") {
        name = `${index}:00`;
      } else {
        const date = new Date();
        date.setDate(date.getDate() - (data.length - index - 1));
        name = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      return {
        name,
        value: point.value,
        timestamp: point.timestamp,
      };
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    } else {
      return num.toLocaleString();
    }
  };

  const formatPercentage = (change: number) => {
    const sign = change >= 0 ? "↑" : "↓";
    const color = change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    return (
      <span className={`text-sm ${color} flex items-center mt-1`}>
        <span className="mr-1">{sign}</span> {Math.abs(change).toFixed(1)}% from previous period
      </span>
    );
  };

  if (loading) {
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
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (error) {
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
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!networkStats) {
    return null;
  }

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
              {formatNumber(networkStats.transactionVolume.totalTransactions)}
            </p>
            {formatPercentage(networkStats.transactionVolume.percentageChange)}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Avg: {formatNumber(networkStats.transactionVolume.averagePerDay)} per day
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
              {formatNumber(networkStats.blockProduction.totalBlocks)}
            </p>
            {formatPercentage(networkStats.blockProduction.percentageChange)}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Avg: {networkStats.blockProduction.averageBlockTime}s per block
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
              {networkStats.gasUsage.averageGasPrice} Gwei
            </p>
            {formatPercentage(networkStats.gasUsage.percentageChange)}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Total gas used: {formatNumber(networkStats.gasUsage.totalGasUsed)}
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
              {networkStats.validatorStats.activeValidators}
            </p>
            {formatPercentage(networkStats.validatorStats.percentageChange)}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Total: {networkStats.validatorStats.totalValidators} validators
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
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="h-64">
            <ModernLineChart 
              data={convertToChartData(networkStats.transactionVolume.data)}
              color="#8C30F5"
              height={250}
              showArea={true}
            />
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
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="h-64">
            <ModernLineChart 
              data={convertToChartData(networkStats.blockProduction.data)}
              color="#0CCBD6"
              height={250}
              showArea={true}
            />
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
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="h-64">
            <ModernLineChart 
              data={convertToChartData(networkStats.gasUsage.data)}
              color="#FF6B6B"
              height={250}
              showArea={true}
            />
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
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="h-64">
            <ModernLineChart 
              data={convertToChartData(networkStats.validatorStats.data)}
              color="#4CAF50"
              height={250}
              showArea={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;

import React, { useState, useEffect } from "react";
import {
  CubeIcon,
  ArrowsRightLeftIcon,
  ServerIcon,
  CurrencyDollarIcon,
  ClockIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../../services/api";
import type { NetworkStats } from "../../types";

interface NetworkStatsDashboardProps {
  className?: string;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-2">
            <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded mr-2"></div>
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="mt-2">
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-2">
        <Icon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {trend && (
          <p
            className={`text-sm flex items-center mt-1 ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <span className="mr-1">{trend.isPositive ? "↑" : "↓"}</span>
            {Math.abs(trend.value).toFixed(1)}%
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const NetworkStatsDashboard: React.FC<NetworkStatsDashboardProps> = ({
  className = "",
}) => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const networkStats = await apiService.getNetworkStats();
        setStats(networkStats);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching network stats:", err);
        setError("Failed to load network statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatGasPrice = (gasPrice: string) => {
    const price = parseFloat(gasPrice);
    if (price === 0) return "0";
    if (price < 0.01) return price.toFixed(4);
    if (price < 1) return price.toFixed(3);
    return price.toFixed(2);
  };

  const formatTVL = (tvl: string) => {
    const value = parseFloat(tvl);
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
  };

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <SignalIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
          Network Statistics
        </h2>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          Updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={CubeIcon}
          title="Latest Block"
          value={stats?.latestBlock || 0}
          subtitle="Current height"
          loading={loading}
        />

        <StatCard
          icon={ClockIcon}
          title="Block Time"
          value={`${stats?.averageBlockTime || 0}s`}
          subtitle="Average time"
          loading={loading}
        />

        <StatCard
          icon={ArrowsRightLeftIcon}
          title="Total Transactions"
          value={stats?.totalTransactions || 0}
          subtitle="All time"
          loading={loading}
        />

        <StatCard
          icon={CurrencyDollarIcon}
          title="Gas Price"
          value={`${formatGasPrice(stats?.gasPrice || "0")} Gwei`}
          subtitle="Current average"
          loading={loading}
        />

        <StatCard
          icon={ServerIcon}
          title="Validators"
          value={`${stats?.validators.active || 0}/${stats?.validators.total || 0}`}
          subtitle="Active/Total"
          loading={loading}
        />

        <StatCard
          icon={CurrencyDollarIcon}
          title="Total Staked"
          value={`${formatTVL(stats?.totalValueLocked || "0")} SEL`}
          subtitle="Value locked"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default NetworkStatsDashboard;

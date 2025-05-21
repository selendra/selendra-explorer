import React from "react";
import { useParams, Link } from "react-router-dom";
import { useToken } from "../contexts/ApiContext";
import TimeAgo from "../components/ui/TimeAgo";
import AddressDisplay from "../components/ui/AddressDisplay";
import NetworkBadge from "../components/ui/NetworkBadge";
import TokenIcon from "../components/ui/TokenIcon";
import LineChart from "../components/charts/LineChart";

// Mock data for the chart
const generateTokenPriceData = () => {
  const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  const priceData = Array.from({ length: 30 }, (_, i) => {
    const basePrice = 1 + Math.random() * 2;
    return basePrice + Math.sin(i / 3) * 0.5;
  });

  return {
    labels,
    datasets: [
      {
        label: "Token Price (USD)",
        data: priceData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
    ],
  };
};

const TokenDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { data: token, isLoading, error } = useToken(address || "");

  const chartData = generateTokenPriceData();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Token Not Found
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          The token you are looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/tokens"
          className="mt-6 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View All Tokens
        </Link>
      </div>
    );
  }

  // Format total supply based on token type
  const formattedTotalSupply = () => {
    if (token.type === "erc20" || token.type === "substrate_asset") {
      const supply = parseFloat(token.totalSupply);
      const decimals = token.decimals;
      return (supply / Math.pow(10, decimals)).toLocaleString();
    }
    return token.totalSupply;
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <TokenIcon
            name={token.name}
            symbol={token.symbol}
            logoUrl={token.logoUrl}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {token.name} ({token.symbol})
            </h1>
            <div className="flex items-center mt-1 space-x-2">
              <NetworkBadge type={token.networkType} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {token.type.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Token Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Token Address
              </div>
              <div className="font-mono text-sm break-all">{token.address}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Creator
              </div>
              <AddressDisplay
                address={token.creator}
                networkType={token.networkType}
                truncate={false}
                className="text-sm"
              />
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Created At
              </div>
              <div className="font-medium">
                <TimeAgo timestamp={token.createdAt} /> (
                {new Date(token.createdAt).toLocaleString()})
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Decimals
              </div>
              <div className="font-medium">{token.decimals}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Supply
              </div>
              <div className="font-medium">
                {formattedTotalSupply()} {token.symbol}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Holders
              </div>
              <div className="font-medium">
                {token.holderCount?.toLocaleString() ||
                  token.holders?.toLocaleString() ||
                  "0"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Transfers
              </div>
              <div className="font-medium">
                {token.transferCount?.toLocaleString() || "0"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Contract Type
              </div>
              <div className="font-medium capitalize">
                {token.type.replace("_", " ")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart (Mock) */}
      {(token.type === "erc20" || token.type === "substrate_asset") && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Price History
          </h2>
          <LineChart data={chartData} height={300} />
          <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Note: This is simulated data for demonstration purposes.
          </div>
        </div>
      )}

      {/* Token Contract */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Token Contract
        </h2>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Contract Address
            </div>
            <div className="font-mono text-sm break-all">{token.address}</div>
          </div>

          <div className="flex justify-between">
            <Link
              to={`/contracts/${token.address}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Contract Details
            </Link>

            <Link
              to={`/transactions?address=${token.address}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetails;

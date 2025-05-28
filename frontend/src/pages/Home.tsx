import * as React from "react";
import { Link } from "react-router-dom";
import LineChart from "../components/charts/LineChart";
import {
  CubeIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CircleStackIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { mockBlocks } from "../mocks/blocks";
import { mockTransactions } from "../mocks/transactions";
import { mockNetworkStats } from "../mocks/networkStats";

/**
 * Generates chart data for homepage activity chart
 */
const generateChartData = () => {
  const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  const transactionData = Array.from(
    { length: 30 },
    () => Math.floor(Math.random() * 5000) + 1000
  );
  const blockData = Array.from(
    { length: 30 },
    () => Math.floor(Math.random() * 500) + 100
  );

  return {
    labels,
    datasets: [
      {
        label: "Transactions",
        data: transactionData,
        borderColor: "#8C30F5", // Selendra primary purple
        backgroundColor: "rgba(140, 48, 245, 0.2)", // With opacity
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: "Blocks",
        data: blockData,
        borderColor: "#0CCBD6", // Selendra accent teal
        backgroundColor: "rgba(12, 203, 214, 0.2)", // With opacity
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };
};

const Home: React.FC = () => {
  const blocksData = React.useMemo(
    () => ({
      items: mockBlocks.slice(0, 15),
      totalCount: mockBlocks.length,
    }),
    []
  );
  const transactionsData = React.useMemo(
    () => ({
      items: mockTransactions.slice(0, 15),
      totalCount: mockTransactions.length,
    }),
    []
  );
  const isLoadingBlocks = false;
  const isLoadingTransactions = false;
  const networkStats = mockNetworkStats;

  // Mocked total supply since it's not in the NetworkStats type
  const totalSupply = "601,091,728.63";

  const chartData = React.useMemo(() => generateChartData(), []);

  return (
    <div className="container mx-auto space-y-8 sm:space-y-12 pt-6 px-4 sm:px-6 lg:px-8">
      {/* Network Stats Cards */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <InformationCircleIcon className="h-7 w-7 mr-3 text-[#be8df5] dark:text-[#9D50FF]" />
          Network Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* SEL Supply Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {totalSupply}
            </p>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
              <img src="/sel/coin.png" alt="SEL" className="h-6 w-6 mr-1.5" />
              <span className="font-medium">SEL Supply</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Circulating Supply
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  519,934,494.2608 SEL (86.5%)
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Non-circulating Supply
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  81,157,234.3749 SEL (13.5%)
                </p>
              </div>
            </div>
          </div>

          {/* Current Era Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-baseline mb-1">
              <p className="text-2xl font-bold text-[#8C30F5] dark:text-[#9D50FF]">
                789
              </p>
              <p className="ml-2 text-xs text-gray-500 dark:text-gray-400 self-end">
                (99.11%)
              </p>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
              <ClockIcon className="h-5 w-5 mr-1.5 text-[#8C30F5] dark:text-[#9D50FF]" />
              <span className="font-medium">Current Era</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-[#8C30F5] to-[#0CCBD6]"
                style={{ width: "99.11%" }}
              ></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Session Range
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  1059 to 1200
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Time Remain
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  0d 0h 25m 4s
                </p>
              </div>
            </div>
          </div>

          {/* Network Transactions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              408,038,649,822
            </p>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
              <ArrowsRightLeftIcon className="h-5 w-5 mr-1.5 text-[#8C30F5] dark:text-[#9D50FF]" />
              <span className="font-medium">Network Transactions</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Block Height
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {networkStats.latestBlock.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    TPS
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    4,373.5
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    True TPS{" "}
                    <span className="ml-1 text-gray-400 dark:text-gray-500">
                      ⓘ
                    </span>
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    1,336
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Stake Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              394,799,619.14
            </p>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
              <div className="flex items-center">
                <CircleStackIcon className="h-5 w-5 mr-1.5 text-[#8C30F5] dark:text-[#9D50FF]" />
                <span className="font-medium">Total Stake (SEL)</span>
              </div>
              <Link
                to="/staking"
                className="text-[#8C30F5] text-xs font-medium flex items-center hover:underline dark:text-[#9D50FF]"
              >
                Staking Dashboard <ChevronRightIcon className="h-3 w-3 ml-1" />
              </Link>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Current Stake
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  394,499,899.8673 SEL (99.9%)
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Delinquent Stake
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  299,719.2756 SEL (0.1%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Chart Section */}
      <section className="pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="h-7 w-7 mr-3 text-[#8C30F5] dark:text-[#9D50FF]" />
              Network Activity
            </h2>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-gradient-to-r from-[#8C30F5] to-[#9D50FF] text-white rounded-md text-sm font-medium shadow-sm hover:shadow transition-all duration-200">
                7D
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                1M
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                3M
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                1Y
              </button>
            </div>
          </div>
          <div
            className="bg-gray-50/50 dark:bg-gray-900/20 p-4 rounded-lg"
            style={{ height: "340px", overflow: "hidden" }}
          >
            <LineChart data={chartData} />
          </div>
          <div className="h-6"></div> {/* Extra spacing to prevent overlay */}
        </div>
      </section>
      {/* Latest Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Blocks */}
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 text-[#8C30F5] dark:text-[#9D50FF]" />
                Latest Blocks
              </h2>
              <Link
                to="/blocks"
                className="text-[#8C30F5] dark:text-[#9D50FF] text-sm font-medium flex items-center hover:underline"
              >
                View All
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="h-10">
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Block
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Age
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Txns
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Validator
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoadingBlocks
                    ? Array(15)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i} className="animate-pulse h-10">
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </td>
                          </tr>
                        ))
                    : blocksData.items.map((block) => (
                        <tr
                          key={block.hash}
                          className="hover:bg-gray-50 dark:hover:bg-gray-750 h-10"
                        >
                          <td className="px-6 py-2 whitespace-nowrap">
                            <Link
                              to={`/blocks/${block.number}`}
                              className="text-[#8C30F5] dark:text-[#9D50FF] font-medium hover:underline"
                            >
                              {block.number}
                            </Link>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {block.timestamp}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {block.transactionCount}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            <Link
                              to={`/validators/${block.validator}`}
                              className="text-gray-900 dark:text-gray-100 hover:text-[#8C30F5] dark:hover:text-[#9D50FF]"
                            >
                              {block.validator.slice(0, 8)}...
                              {block.validator.slice(-6)}
                            </Link>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Latest Transactions */}
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-[#0CCBD6] dark:text-[#0EDAE6]" />
                Latest Transactions
              </h2>
              <Link
                to="/transactions"
                className="text-[#0CCBD6] dark:text-[#0EDAE6] text-sm font-medium flex items-center hover:underline"
              >
                View All
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="h-10">
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Txn Hash
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Age
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      From
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      To
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-2.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoadingTransactions
                    ? Array(15)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i} className="animate-pulse h-10">
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div>
                            </td>
                          </tr>
                        ))
                    : transactionsData.items.map((tx) => (
                        <tr
                          key={tx.hash}
                          className="hover:bg-gray-50 dark:hover:bg-gray-750 h-10"
                        >
                          <td className="px-6 py-2 whitespace-nowrap">
                            <Link
                              to={`/transactions/${tx.hash}`}
                              className="text-[#0CCBD6] dark:text-[#0EDAE6] font-medium hover:underline"
                            >
                              {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                            </Link>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {tx.timestamp}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            <Link
                              to={`/accounts/${tx.from}`}
                              className="text-gray-900 dark:text-gray-100 hover:text-[#8C30F5] dark:hover:text-[#9D50FF]"
                            >
                              {tx.from.slice(0, 8)}...{tx.from.slice(-6)}
                            </Link>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            {tx.to && (
                              <Link
                                to={`/accounts/${tx.to}`}
                                className="text-gray-900 dark:text-gray-100 hover:text-[#8C30F5] dark:hover:text-[#9D50FF]"
                              >
                                {tx.to.slice(0, 8)}...{tx.to.slice(-6)}
                              </Link>
                            )}
                            {!tx.to && (
                              <span className="text-gray-500 dark:text-gray-400">
                                Contract Creation
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-right text-gray-900 dark:text-gray-100">
                            {tx.value} SEL
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";

interface Validator {
  address: string;
  name?: string;
  identity?: string;
  total_stake: string;
  self_stake: string;
  commission_rate: number;
  active: boolean;
  blocks_produced: number;
  uptime_percentage: number;
  delegator_count: number;
  apy?: number;
}

interface ValidatorStats {
  total_validators: number;
  active_validators: number;
  total_staked: string;
  average_commission: number;
  average_apy?: number;
}

const Validators: React.FC = () => {
  const api = useApi();
  const [validators, setValidators] = useState<Validator[]>([]);
  const [stats, setStats] = useState<ValidatorStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("total_stake");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(true);

  useEffect(() => {
    const fetchValidators = async () => {
      try {
        setIsLoading(true);

        // Fetch validators
        const response = await fetch(
          `/api/validators?page=${page}&page_size=10&sort_by=${sortBy}&sort_order=${sortOrder}${
            activeFilter !== null ? `&active=${activeFilter}` : ""
          }`
        );
        const data = await response.json();
        setValidators(data.validators);
        setTotalPages(Math.ceil(data.total / data.page_size));

        // Fetch validator stats
        const statsResponse = await fetch("/api/validators/stats");
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch validators:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchValidators();
  }, [page, sortBy, sortOrder, activeFilter]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const formatStake = (stake: string) => {
    try {
      const value = parseFloat(stake);
      return (
        value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SEL"
      );
    } catch {
      return stake;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Validators</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Total Validators
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats.total_validators}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats.active_validators} active
            </p>
          </div>

          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Total Staked
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {formatStake(stats.total_staked)}
            </p>
          </div>

          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Average Commission
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {formatPercentage(stats.average_commission)}
            </p>
          </div>

          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Average APY
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats.average_apy ? formatPercentage(stats.average_apy) : "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-full ${
                  activeFilter === true
                    ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setActiveFilter(true)}
              >
                Active
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-full ${
                  activeFilter === false
                    ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setActiveFilter(false)}
              >
                Inactive
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-full ${
                  activeFilter === null
                    ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setActiveFilter(null)}
              >
                All
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              className="input"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="total_stake-desc">Stake (High to Low)</option>
              <option value="total_stake-asc">Stake (Low to High)</option>
              <option value="commission_rate-asc">
                Commission (Low to High)
              </option>
              <option value="commission_rate-desc">
                Commission (High to Low)
              </option>
              <option value="blocks_produced-desc">
                Blocks Produced (High to Low)
              </option>
              <option value="uptime_percentage-desc">
                Uptime (High to Low)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Validators Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse p-4 space-y-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Validator
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("total_stake")}
                    >
                      Total Stake
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("commission_rate")}
                    >
                      Commission
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("uptime_percentage")}
                    >
                      Uptime
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("apy")}
                    >
                      APY
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {validators.map((validator) => (
                    <tr
                      key={validator.address}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-300 font-medium">
                              {validator.name
                                ? validator.name[0]
                                : validator.address[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">
                              <Link
                                to={`/validators/${validator.address}`}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                {validator.name ||
                                  formatAddress(validator.address)}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatAddress(validator.address)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {formatStake(validator.total_stake)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {validator.delegator_count} delegators
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {formatPercentage(validator.commission_rate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {formatPercentage(validator.uptime_percentage)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {validator.blocks_produced} blocks
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {validator.apy
                            ? formatPercentage(validator.apy)
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/my-staking?validator=${validator.address}`}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          Stake
                        </Link>
                        <Link
                          to={`/validators/${validator.address}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{" "}
                      <span className="font-medium">{(page - 1) * 10 + 1}</span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(page * 10, validators.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{validators.length}</span>{" "}
                      validators
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === i + 1
                              ? "z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-200"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Validators;

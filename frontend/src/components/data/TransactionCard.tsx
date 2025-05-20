import { type FC } from "react";
import { Link } from "react-router-dom";
import { type Transaction } from "../../types";
import TimeAgo from "../ui/TimeAgo";
import AddressDisplay from "../ui/AddressDisplay";
import NetworkBadge from "../ui/NetworkBadge";
import StatusBadge from "../ui/StatusBadge";
import {
  ArrowsRightLeftIcon,
  CubeIcon,
  FireIcon,
  ChevronRightIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/outline";

interface TransactionCardProps {
  transaction: Transaction;
  className?: string;
  isLoading?: boolean;
}

const TransactionCard: FC<TransactionCardProps> = ({
  transaction,
  className = "",
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5 ${className} animate-pulse`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          </div>
          <div className="text-right">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Determine transaction type for styling
  const isContractCreation = !transaction.to;
  const isTokenTransfer = transaction.to && transaction.value === "0"; // Simplified check

  // Get border color based on transaction type
  const getBorderColor = () => {
    if (transaction.status === "failed")
      return "border-red-400 dark:border-red-600";
    if (isContractCreation) return "border-purple-400 dark:border-purple-600";
    if (isTokenTransfer) return "border-green-400 dark:border-green-600";
    return "border-blue-400 dark:border-blue-600";
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border-l-4 ${getBorderColor()} border border-gray-100 dark:border-gray-700 p-5 transition-all duration-300 ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <Link
            to={`/transactions/${transaction.hash}`}
            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center"
          >
            <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            <span className="font-mono">
              {transaction.hash.substring(0, 10)}...
              {transaction.hash.substring(transaction.hash.length - 8)}
            </span>
          </Link>
          <div className="mt-1 flex items-center space-x-2">
            <TimeAgo
              timestamp={transaction.timestamp}
              className="text-gray-500 dark:text-gray-400 text-xs"
            />
            <NetworkBadge type={transaction.networkType} />
            <StatusBadge status={transaction.status} />
            {isContractCreation && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Contract Creation
              </span>
            )}
            {isTokenTransfer && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Token Transfer
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm flex items-center justify-end">
            <CubeIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
            <Link
              to={`/blocks/${transaction.blockNumber}`}
              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              #{transaction.blockNumber.toLocaleString()}
            </Link>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fee: <span className="font-medium">{transaction.fee} SEL</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              From
            </div>
            <AddressDisplay
              address={transaction.from}
              networkType={transaction.networkType}
              truncate={true}
              className="text-sm text-gray-700 dark:text-gray-300 font-medium"
            />
          </div>

          <div className="hidden sm:block text-gray-400 dark:text-gray-600">
            <ArrowLongRightIcon className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              To
            </div>
            {transaction.to ? (
              <AddressDisplay
                address={transaction.to}
                networkType={transaction.networkType}
                truncate={true}
                className="text-sm text-gray-700 dark:text-gray-300 font-medium"
              />
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                Contract Creation
              </span>
            )}
          </div>

          <div className="sm:ml-4 mt-2 sm:mt-0 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 flex items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mr-2">
              Value
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {transaction.value} SEL
            </div>
          </div>
        </div>
      </div>

      {transaction.networkType === "evm" && (
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="bg-gray-50 dark:bg-gray-900/30 p-2 rounded-md border border-gray-100 dark:border-gray-800">
            <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <FireIcon className="w-3 h-3 mr-1" />
              Gas Price
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {transaction.gasPrice} Gwei
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 p-2 rounded-md border border-gray-100 dark:border-gray-800">
            <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <FireIcon className="w-3 h-3 mr-1" />
              Gas Limit
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {transaction.gasLimit}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 p-2 rounded-md border border-gray-100 dark:border-gray-800">
            <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <FireIcon className="w-3 h-3 mr-1" />
              Gas Used
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {transaction.gasUsed}
              {transaction.gasUsed && transaction.gasLimit && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  (
                  {(
                    (parseInt(transaction.gasUsed || "0") /
                      parseInt(transaction.gasLimit || "1")) *
                    100
                  ).toFixed(2)}
                  %)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Link
          to={`/transactions/${transaction.hash}`}
          className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200 hover:bg-primary-100 dark:hover:bg-primary-800/30"
        >
          View Details
          <ChevronRightIcon className="ml-1 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default TransactionCard;

import { type FC } from "react";
import { Link } from "react-router-dom";
import { type Block } from "../../types";
import TimeAgo from "../ui/TimeAgo";
import AddressDisplay from "../ui/AddressDisplay";
import NetworkBadge from "../ui/NetworkBadge";
import {
  CubeIcon,
  ArrowsRightLeftIcon,
  ScaleIcon,
  FireIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

/**
 * Card component for displaying block details
 */
interface BlockCardProps {
  block: Block;
  className?: string;
  isLoading?: boolean;
}

const BlockCard: FC<BlockCardProps> = ({
  block,
  className = "",
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5 ${className} animate-pulse`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="ml-auto">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border-l-4 border border-primary-400 dark:border-primary-600 hover:border-primary-500 dark:hover:border-primary-500 p-5 transition-all duration-300 hover-lift ${className}`}
    >
      <div className="flex items-start">
        <div className="hidden sm:flex mr-4 p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400 shadow-sm">
          <CubeIcon className="h-8 w-8" />
        </div>

        <div className="flex-grow">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <Link
                to={`/blocks/${block.number}`}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center"
              >
                Block #{block.number.toLocaleString()}
                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                  Finalized
                </span>
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <TimeAgo
                  timestamp={block.timestamp}
                  className="text-gray-500 dark:text-gray-400 text-sm"
                />
                <NetworkBadge type={block.networkType} />
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-end">
                <ArrowsRightLeftIcon className="w-4 h-4 mr-1 text-primary-500 dark:text-primary-400" />
                <span className="font-semibold">{block.transactionCount}</span>{" "}
                {block.transactionCount !== 1 ? "txs" : "tx"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end">
                <ScaleIcon className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                {(block.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center">
                <span className="bg-gray-100 dark:bg-gray-700 rounded-full w-4 h-4 inline-flex items-center justify-center mr-1 text-gray-500 dark:text-gray-400">
                  #
                </span>
                Hash
              </div>
              <div className="font-mono text-sm truncate text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 group">
                <div className="flex items-center">
                  <span className="truncate">{block.hash}</span>
                  <button className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center">
                <span className="bg-gray-100 dark:bg-gray-700 rounded-full w-4 h-4 inline-flex items-center justify-center mr-1 text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </span>
                Validator
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 group">
                <div className="flex items-center justify-between">
                  <AddressDisplay
                    address={block.validator}
                    networkType={block.networkType}
                    truncate={true}
                    className="text-sm text-gray-700 dark:text-gray-300"
                  />
                  <button className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {block.networkType === "evm" && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center">
                  <FireIcon className="w-3 h-3 mr-1 text-orange-500" />
                  Gas Used
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span>{parseInt(block.gasUsed).toLocaleString()}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                      {(
                        (parseInt(block.gasUsed) / parseInt(block.gasLimit)) *
                        100
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 dark:bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${
                          (parseInt(block.gasUsed) / parseInt(block.gasLimit)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center">
                  <FireIcon className="w-3 h-3 mr-1 text-orange-500" />
                  Gas Limit
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span>{parseInt(block.gasLimit).toLocaleString()}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                      Max
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Link
              to={`/blocks/${block.number}`}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200 hover:bg-primary-100 dark:hover:bg-primary-800/30 shadow-sm"
            >
              View Details
              <ChevronRightIcon className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockCard;

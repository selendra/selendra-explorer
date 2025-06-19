import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTokens } from "../contexts/ApiContext";
import DataTable from "../components/data/DataTable";
import Pagination from "../components/ui/Pagination";
import TimeAgo from "../components/ui/TimeAgo";
import NetworkBadge from "../components/ui/NetworkBadge";
import TokenIcon from "../components/ui/TokenIcon";
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  TagIcon,
  UsersIcon,
  QueueListIcon,
  DocumentDuplicateIcon,
  PresentationChartLineIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

const TokenTypeButtons = ({
  selected,
  onChange,
}: {
  selected: string | undefined;
  onChange: (type: string | undefined) => void;
}) => {
  const types = [
    { id: undefined, name: "All" },
    { id: "erc20", name: "ERC20" },
    { id: "erc721", name: "ERC721 (NFT)" },
    { id: "erc1155", name: "ERC1155" },
    { id: "substrate_asset", name: "Substrate Asset" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {types.map((type) => (
        <button
          key={type.id || "all"}
          onClick={() => onChange(type.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            selected === type.id
              ? "bg-primary-600 text-white shadow-sm ring-1 ring-primary-500"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm"
          }`}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
};

const NetworkTypeButtons = ({
  selected,
  onChange,
}: {
  selected: "evm" | "wasm" | undefined;
  onChange: (type: "evm" | "wasm" | undefined) => void;
}) => {
  const types = [
    { id: undefined, name: "All" },
    { id: "evm", name: "EVM" },
    { id: "wasm", name: "Wasm" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {types.map((type) => (
        <button
          key={type.id || "all"}
          onClick={() => onChange(type.id as "evm" | "wasm" | undefined)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            selected === type.id
              ? "bg-primary-600 text-white shadow-sm ring-1 ring-primary-500"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm"
          }`}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
};

const Tokens: React.FC = () => {
  const [page, setPage] = useState(1);
  const [tokenType, setTokenType] = useState<string | undefined>(undefined);
  const [networkType, setNetworkType] = useState<"evm" | "wasm" | undefined>(
    undefined
  );
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const pageSize = 20;
  const { data, isLoading, error, refetch } = useTokens(page, pageSize, tokenType);

  // Filter data by network type if specified
  const filteredData = data ? {
    ...data,
    items: networkType 
      ? data.items.filter(token => token.networkType === networkType)
      : data.items,
    totalCount: networkType 
      ? data.items.filter(token => token.networkType === networkType).length
      : data.totalCount
  } : null;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [tokenType, networkType]);

  const handleTokenTypeChange = (type: string | undefined) => {
    setTokenType(type);
    setPage(1);
  };

  const handleNetworkTypeChange = (type: "evm" | "wasm" | undefined) => {
    setNetworkType(type);
    setPage(1);
  };


  const copyToClipboard = (text: string | null) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  const handleRefresh = async () => {
    await refetch();
    // Also invalidate related queries
    queryClient.invalidateQueries({ queryKey: ["tokens"] });
  };

  const totalPages = filteredData ? Math.ceil(filteredData.totalCount / pageSize) : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
            Tokens
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Browse all tokens on the Selendra blockchain. Includes ERC20, ERC721
            (NFT), ERC1155 tokens and native Substrate assets.
          </p>
        </div>

        <button
          className="btn-gradient self-start flex items-center px-5 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all hover:shadow-md"
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label="Refresh tokens"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Controls */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="space-y-5">
          <div>
            <div className="flex items-center mb-3 text-base font-medium text-gray-800 dark:text-gray-200">
              <TagIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
              Token Type
            </div>
            <TokenTypeButtons selected={tokenType} onChange={handleTokenTypeChange} />
          </div>

          <div>
            <div className="flex items-center mb-3 text-base font-medium text-gray-800 dark:text-gray-200">
              <QueueListIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
              Network Type
            </div>
            <NetworkTypeButtons
              selected={networkType}
              onChange={handleNetworkTypeChange}
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
          <div className="text-red-800 dark:text-red-200 font-medium mb-2">
            Failed to load tokens
          </div>
          <div className="text-red-600 dark:text-red-300 text-sm">
            {error.message || "An unexpected error occurred"}
          </div>
          <button
            onClick={handleRefresh}
            className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Total Tokens
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && filteredData ? (
              filteredData.totalCount.toLocaleString()
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            New tokens (24h): +5
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <PresentationChartLineIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            {tokenType === "erc20"
              ? "Total ERC20"
              : tokenType === "erc721"
              ? "Total NFTs"
              : tokenType === "erc1155"
              ? "Total ERC1155"
              : "ERC20 Tokens"}
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading && filteredData?.totalCount ? (
              tokenType ? (
                filteredData.totalCount.toLocaleString()
              ) : (
                Math.floor(filteredData.totalCount * 0.7).toLocaleString()
              )
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {tokenType ? (
              <span className="text-primary-600 dark:text-primary-400">
                100%
              </span>
            ) : (
              <span className="text-primary-600 dark:text-primary-400">
                70%
              </span>
            )}{" "}
            of {tokenType ? tokenType.toUpperCase() : "total"} tokens
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
            Total Token Holders
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {!isLoading ? (
              "12,547"
            ) : (
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Across {filteredData?.totalCount || "-"} tokens
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
            {tokenType ? `${tokenType.toUpperCase()} Tokens` : "All Tokens"}
            {networkType && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({networkType.toUpperCase()})
              </span>
            )}
          </h2>

          {!isLoading && filteredData && (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
              Showing tokens {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, filteredData.totalCount)} of{" "}
              {filteredData.totalCount.toLocaleString()}
            </div>
          )}
        </div>

        <DataTable
          columns={[
            {
              header: "Token",
              accessor: (token) => (
                <div className="flex items-center group">
                  <TokenIcon
                    name={token.name}
                    symbol={token.symbol}
                    logoUrl={token.logoUrl}
                    className="mr-3"
                  />
                  <div>
                    <Link
                      to={`/tokens/${token.address}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      {token.name || "Unnamed Token"}
                    </Link>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                      <span className="font-mono">{token.symbol}</span>
                      <button
                        onClick={() => copyToClipboard(token.address)}
                        className={`ml-1.5 transition-colors opacity-0 group-hover:opacity-100 ${
                          copiedAddress === token.address
                            ? "text-green-500 dark:text-green-400"
                            : "text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                        }`}
                        aria-label="Copy token address"
                        title={copiedAddress === token.address ? "Copied!" : "Copy address"}
                      >
                        <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Type",
              accessor: (token) => (
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs ${
                      token.tokenType === "erc20"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : token.tokenType === "erc721"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : token.tokenType === "erc1155"
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {token.tokenType?.toUpperCase() || "Unknown"}
                  </span>
                  <NetworkBadge type={token.networkType} />
                </div>
              ),
            },
            {
              header: "Price",
              accessor: (token) =>
                token.price ? (
                  <div className="font-medium">
                    <div className="text-gray-900 dark:text-white">
                      $
                      {parseFloat(token.price).toFixed(
                        parseFloat(token.price) < 1 ? 4 : 2
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      {token.priceChange24h && token.priceChange24h > 0 ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <CubeIcon className="h-3 w-3 mr-1" />+
                          {token.priceChange24h}%
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <CubeIcon className="h-3 w-3 mr-1" />
                          {token.priceChange24h}%
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                ),
            },
            {
              header: "Market Cap",
              accessor: (token) =>
                token.marketCap ? (
                  <div className="font-medium text-gray-900 dark:text-white">
                    ${parseInt(token.marketCap).toLocaleString()}
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                ),
            },
            {
              header: "Holders",
              accessor: (token) => (
                <div className="flex items-center">
                  <UsersIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {token.holders?.toLocaleString() || "-"}
                  </span>
                </div>
              ),
            },
            {
              header: "Created",
              accessor: (token) => (
                <div className="flex flex-col">
                  <TimeAgo
                    timestamp={token.createdAt}
                    className="text-gray-900 dark:text-white"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ),
            },
            {
              header: "",
              accessor: (token) => (
                <Link
                  to={`/tokens/${token.address}`}
                  className="flex items-center justify-center text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              ),
              className: "w-10",
            },
          ]}
          data={filteredData?.items || []}
          keyExtractor={(token) => token.id}
          isLoading={isLoading}
          emptyMessage="No tokens found."
          loadingRows={10}
          highlightOnHover={true}
          striped={true}
        />

        {filteredData && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default Tokens;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi, Block, Transaction, Extrinsic } from "../contexts/ApiContext";

const Home: React.FC = () => {
  const api = useApi();
  const [latestBlocks, setLatestBlocks] = useState<Block[]>([]);
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>(
    []
  );
  const [latestExtrinsics, setLatestExtrinsics] = useState<Extrinsic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    latest_block_number: 0,
    total_blocks: 0,
    total_transactions: 0,
    total_accounts: 0,
    total_contracts: 0,
    total_evm_contracts: 0,
    total_wasm_contracts: 0,
    avg_block_time: 0,
    avg_transactions_per_block: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest blocks
        const blocksResponse = await api.getBlocks(1, 5);
        setLatestBlocks(blocksResponse.blocks);

        // Fetch latest transactions
        const transactionsResponse = await api.getTransactions(1, 5);
        setLatestTransactions(transactionsResponse.transactions);

        // Fetch latest extrinsics
        const extrinsicsResponse = await api.getExtrinsics(1, 5);
        setLatestExtrinsics(extrinsicsResponse.extrinsics);

        // Fetch stats from the API
        try {
          const statsResponse = await fetch("/api/stats");
          const statsData = await statsResponse.json();
          setStats(statsData);
        } catch (error) {
          console.error("Failed to fetch stats:", error);
          // Fallback to mock data
          setStats({
            latest_block_number: blocksResponse.blocks[0]?.number || 0,
            total_blocks: 1000000,
            total_transactions: 1000000,
            total_accounts: 50000,
            total_contracts: 5000,
            total_evm_contracts: 4000,
            total_wasm_contracts: 1000,
            avg_block_time: 6.0,
            avg_transactions_per_block: 10.5,
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg p-8 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Selendra Blockchain Explorer
          </h1>
          <p className="text-xl mb-6">
            Explore blocks, transactions, accounts, and smart contracts on the
            Selendra network
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/blocks"
              className="btn bg-white text-primary-600 hover:bg-gray-100"
            >
              Explore Blocks
            </Link>
            <Link
              to="/transactions"
              className="btn bg-white text-primary-600 hover:bg-gray-100"
            >
              View Transactions
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Block Height
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats.latest_block_number.toLocaleString()}
            </p>
          </div>
          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Transactions
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats.total_transactions.toLocaleString()}
            </p>
          </div>
          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Accounts
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats.total_accounts.toLocaleString()}
            </p>
          </div>
          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Contracts
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats.total_contracts.toLocaleString()}
            </p>
          </div>
          <div className="card flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              Avg Block Time
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats.avg_block_time.toFixed(2)}s
            </p>
          </div>
        </div>
      </section>

      {/* Latest Data Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Blocks */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Latest Blocks</h2>
            <Link
              to="/blocks"
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {latestBlocks.map((block) => (
                <Link
                  key={block.hash}
                  to={`/blocks/${block.number}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="text-primary-600 font-medium">
                        #{block.number}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {block.transaction_count} txns
                        {block.extrinsic_count
                          ? ` • ${block.extrinsic_count} extrinsics`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(block.timestamp)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Latest Transactions */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Latest Transactions</h2>
            <Link
              to="/transactions"
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {latestTransactions.map((tx) => (
                <Link
                  key={tx.hash}
                  to={`/transactions/${tx.hash}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="text-primary-600 font-medium">
                        {formatAddress(tx.hash)}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        From: {formatAddress(tx.from_address)}
                        {tx.to_address
                          ? ` • To: ${formatAddress(tx.to_address)}`
                          : " • Contract Creation"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(tx.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Latest Extrinsics */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Latest Extrinsics</h2>
            <Link
              to="/extrinsics"
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {latestExtrinsics.map((extrinsic) => (
                <Link
                  key={extrinsic.hash}
                  to={`/extrinsics/${extrinsic.hash}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="text-primary-600 font-medium">
                        {extrinsic.section}.{extrinsic.method}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Block: #{extrinsic.block_number}
                        {extrinsic.signer
                          ? ` • Signer: ${formatAddress(extrinsic.signer)}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(extrinsic.created_at || "")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

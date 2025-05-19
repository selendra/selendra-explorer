import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useApi, Transaction } from "../contexts/ApiContext";

const TransactionDetails: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const api = useApi();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!hash) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch transaction details
        const txData = await api.getTransaction(hash);
        setTransaction(txData);
      } catch (err) {
        console.error("Failed to fetch transaction details:", err);
        setError("Failed to load transaction details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionData();
  }, [api, hash]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link to="/transactions" className="btn btn-primary">
          Back to Transactions
        </Link>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <div className="text-xl mb-4">Transaction not found</div>
        <Link to="/transactions" className="btn btn-primary">
          Back to Transactions
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transaction Details</h1>

      {/* Transaction Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Transaction Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Transaction Hash
            </p>
            <p className="font-mono break-all">{transaction.hash}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Status
            </p>
            <p>
              {transaction.status === true ? (
                <span className="text-green-600 dark:text-green-400">
                  Success
                </span>
              ) : transaction.status === false ? (
                <span className="text-red-600 dark:text-red-400">Failed</span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  Pending
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Block
            </p>
            <Link
              to={`/blocks/${transaction.block_number}`}
              className="text-primary-600 hover:text-primary-900"
            >
              {transaction.block_number}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Timestamp
            </p>
            <p>{formatTimestamp(transaction.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              From
            </p>
            <Link
              to={`/accounts/${transaction.from_address}`}
              className="text-primary-600 hover:text-primary-900 break-all"
            >
              {transaction.from_address}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">To</p>
            {transaction.to_address ? (
              <Link
                to={`/accounts/${transaction.to_address}`}
                className="text-primary-600 hover:text-primary-900 break-all"
              >
                {transaction.to_address}
              </Link>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                Contract Creation
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Value
            </p>
            <p>
              {parseFloat(transaction.value) > 0
                ? `${parseFloat(transaction.value).toFixed(8)} SEL`
                : "0 SEL"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Transaction Fee
            </p>
            <p>
              {/* Calculate fee based on gas price and gas limit */}
              {`${((transaction.gas * transaction.gas_price) / 1e18).toFixed(
                8
              )} SEL`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Gas Price
            </p>
            <p>
              {transaction.gas_price
                ? `${(transaction.gas_price / 1e9).toFixed(2)} Gwei`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Gas Limit
            </p>
            <p>{transaction.gas.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Gas Used
            </p>
            <p>
              {/* We don't have gas_used in our model, so we'll show gas limit instead */}
              {transaction.gas.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Nonce
            </p>
            <p>{transaction.nonce}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Transaction Type
            </p>
            <p>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  transaction.execution_type === "evm"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                }`}
              >
                {transaction.execution_type.toUpperCase()}
              </span>
              {transaction.transaction_type !== null && (
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  (Type {transaction.transaction_type})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Input Data */}
      {transaction.input && transaction.input !== "0x" && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Input Data</h2>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm font-mono break-all whitespace-pre-wrap">
              {transaction.input}
            </pre>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-4">
        <Link
          to={`/blocks/${transaction.block_number}`}
          className="btn btn-outline"
        >
          View Block
        </Link>
        {transaction.to_address && (
          <Link
            to={`/accounts/${transaction.to_address}`}
            className="btn btn-outline"
          >
            View Recipient
          </Link>
        )}
        <Link
          to={`/accounts/${transaction.from_address}`}
          className="btn btn-outline"
        >
          View Sender
        </Link>
      </div>
    </div>
  );
};

export default TransactionDetails;

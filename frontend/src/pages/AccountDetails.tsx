import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useApi, Account, Transaction } from "../contexts/ApiContext";
import { useWallet } from "../contexts/WalletContext";

const AccountDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const api = useApi();
  const { connect, isConnected, address: connectedAddress } = useWallet();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "transactions" | "tokens" | "contracts"
  >("transactions");

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch account details
        const accountData = await api.getAccount(address);
        setAccount(accountData);

        // Fetch transactions for this account
        const txResponse = await api.getTransactions(1, 10, address);
        setTransactions(txResponse.transactions);
      } catch (err) {
        console.error("Failed to fetch account details:", err);
        setError("Failed to load account details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, [api, address]);

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleConnectWallet = async () => {
    try {
      await connect("evm");
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <div className="text-xl mb-4">Account not found</div>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const isOwner =
    isConnected && connectedAddress?.toLowerCase() === address?.toLowerCase();

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Account Details</h1>
        {isOwner ? (
          <div className="mt-4 md:mt-0 px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
            This is your account
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="mt-4 md:mt-0 btn btn-primary"
            disabled={isConnected}
          >
            {isConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Account Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Address
            </p>
            <p className="font-mono break-all">{account.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Balance
            </p>
            <p className="text-xl font-semibold">
              {parseFloat(account.balance) > 0
                ? `${parseFloat(account.balance).toFixed(8)} SEL`
                : "0 SEL"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Transactions
            </p>
            <p>{account.transaction_count.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Type
            </p>
            <p>
              {account.is_contract ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Contract
                </span>
              ) : (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  EOA
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "transactions"
                  ? "text-primary-600 border-primary-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
          </li>
          {account.is_contract && (
            <li className="mr-2">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === "contracts"
                    ? "text-primary-600 border-primary-600"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("contracts")}
              >
                Contract
              </button>
            </li>
          )}
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "tokens"
                  ? "text-primary-600 border-primary-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("tokens")}
            >
              Tokens
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      {activeTab === "transactions" && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Hash
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Block
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      From/To
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Value
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.hash}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/transactions/${tx.hash}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {formatAddress(tx.hash)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/blocks/${tx.block_number}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {tx.block_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.from_address.toLowerCase() ===
                        account.address.toLowerCase() ? (
                          <div>
                            <span className="text-red-500">OUT</span> To:{" "}
                            {tx.to_address ? (
                              <Link
                                to={`/accounts/${tx.to_address}`}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                {formatAddress(tx.to_address)}
                              </Link>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                Contract Creation
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="text-green-500">IN</span> From:{" "}
                            <Link
                              to={`/accounts/${tx.from_address}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              {formatAddress(tx.from_address)}
                            </Link>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parseFloat(tx.value) > 0
                          ? `${parseFloat(tx.value).toFixed(8)} SEL`
                          : "0 SEL"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatTimestamp(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No transactions found for this account.
            </div>
          )}
          {account.transaction_count > transactions.length && (
            <div className="mt-4 text-center">
              <Link
                to={`/accounts/${account.address}/transactions`}
                className="text-primary-600 hover:text-primary-900"
              >
                View all {account.transaction_count} transactions
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "tokens" && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Tokens</h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Token information will be available soon.
          </div>
        </div>
      )}

      {activeTab === "contracts" && account.is_contract && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Contract</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Contract Type
              </p>
              <p>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  EVM
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Verification Status
              </p>
              <p>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Not Verified
                </span>
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link
              to={`/contracts/${account.address}`}
              className="btn btn-primary"
            >
              View Contract Details
            </Link>
            <Link
              to={`/contracts/${account.address}/verify`}
              className="btn btn-outline"
            >
              Verify Contract
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetails;

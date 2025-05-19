import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useApi, Contract, Transaction } from "../contexts/ApiContext";

const ContractDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const api = useApi();
  const [contract, setContract] = useState<Contract | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "code" | "transactions" | "read" | "write"
  >("code");

  useEffect(() => {
    const fetchContractData = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch contract details
        const contractData = await api.getContract(address);
        setContract(contractData);

        // Fetch transactions for this contract
        const txResponse = await api.getTransactions(1, 10, address);
        setTransactions(txResponse.transactions);
      } catch (err) {
        console.error("Failed to fetch contract details:", err);
        setError("Failed to load contract details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();
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

  if (!contract) {
    return (
      <div className="text-center py-12">
        <div className="text-xl mb-4">Contract not found</div>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contract Details</h1>

      {/* Contract Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Contract Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Address
            </p>
            <p className="font-mono break-all">{contract.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Balance
            </p>
            <p className="text-xl font-semibold">
              {parseFloat(contract.balance) > 0
                ? `${parseFloat(contract.balance).toFixed(8)} SEL`
                : "0 SEL"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Contract Type
            </p>
            <p>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  contract.contract_type === "evm"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                }`}
              >
                {contract.contract_type.toUpperCase()}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Creator
            </p>
            <Link
              to={`/accounts/${contract.creator_address}`}
              className="text-primary-600 hover:text-primary-900 break-all"
            >
              {formatAddress(contract.creator_address)}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Creation Transaction
            </p>
            <Link
              to={`/transactions/${contract.creator_transaction_hash}`}
              className="text-primary-600 hover:text-primary-900 break-all"
            >
              {formatAddress(contract.creator_transaction_hash)}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Verification Status
            </p>
            <p>
              {contract.verified ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Verified
                </span>
              ) : (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Not Verified
                </span>
              )}
            </p>
          </div>
          {contract.name && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Name
              </p>
              <p>{contract.name}</p>
            </div>
          )}
          {contract.compiler_version && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Compiler Version
              </p>
              <p>{contract.compiler_version}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "code"
                  ? "text-primary-600 border-primary-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("code")}
            >
              Code
            </button>
          </li>
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
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "read"
                  ? "text-primary-600 border-primary-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("read")}
            >
              Read Contract
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "write"
                  ? "text-primary-600 border-primary-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("write")}
            >
              Write Contract
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      {activeTab === "code" && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Contract Code</h2>
            {!contract.verified && (
              <Link
                to={`/contracts/${contract.address}/verify`}
                className="btn btn-sm btn-primary"
              >
                Verify Contract
              </Link>
            )}
          </div>

          {contract.verified ? (
            <div>
              {contract.abi && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">ABI</h3>
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm font-mono break-all whitespace-pre-wrap">
                      {contract.abi}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-2">Bytecode</h3>
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm font-mono break-all whitespace-pre-wrap">
                    {contract.bytecode}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-4">
                This contract is not verified. Verify the contract to see the
                source code.
              </p>
              <Link
                to={`/contracts/${contract.address}/verify`}
                className="btn btn-primary"
              >
                Verify Contract
              </Link>
            </div>
          )}
        </div>
      )}

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
                      From
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
                        <Link
                          to={`/accounts/${tx.from_address}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {formatAddress(tx.from_address)}
                        </Link>
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
              No transactions found for this contract.
            </div>
          )}
        </div>
      )}

      {activeTab === "read" && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Read Contract</h2>
          {contract.verified && contract.abi ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Contract read functionality will be available soon.
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-4">
                This contract is not verified. Verify the contract to interact
                with it.
              </p>
              <Link
                to={`/contracts/${contract.address}/verify`}
                className="btn btn-primary"
              >
                Verify Contract
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "write" && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Write Contract</h2>
          {contract.verified && contract.abi ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Contract write functionality will be available soon. Connect your
              wallet to interact with this contract.
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-4">
                This contract is not verified. Verify the contract to interact
                with it.
              </p>
              <Link
                to={`/contracts/${contract.address}/verify`}
                className="btn btn-primary"
              >
                Verify Contract
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractDetails;

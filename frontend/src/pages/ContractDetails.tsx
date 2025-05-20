import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContract, useTransactions } from '../contexts/ApiContext';
import DataTable from '../components/data/DataTable';
import Pagination from '../components/ui/Pagination';
import TimeAgo from '../components/ui/TimeAgo';
import AddressDisplay from '../components/ui/AddressDisplay';
import NetworkBadge from '../components/ui/NetworkBadge';
import StatusBadge from '../components/ui/StatusBadge';

const ContractDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { data: contract, isLoading: isLoadingContract, error } = useContract(address || '');
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: transactionsData, isLoading: isLoadingTransactions } = useTransactions(page, pageSize, address);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const totalPages = transactionsData ? Math.ceil(transactionsData.totalCount / pageSize) : 0;
  
  if (isLoadingContract) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  if (error || !contract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Contract Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          The contract you are looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/contracts"
          className="mt-6 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View All Contracts
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {contract.name || 'Contract'}
          </h1>
          <NetworkBadge type={contract.networkType} />
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            contract.verified
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {contract.verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
        <div className="mt-1 text-gray-600 dark:text-gray-300">
          {contract.contractType || 'Smart Contract'}
        </div>
      </div>
      
      {/* Contract Overview */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contract Overview</h2>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Address</div>
            <div className="font-mono text-sm break-all">{contract.address}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Creator</div>
              <AddressDisplay
                address={contract.creator}
                networkType={contract.networkType}
                truncate={false}
                className="text-sm"
              />
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Creation Transaction</div>
              <Link to={`/transactions/${contract.creationTransaction}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm">
                {`${contract.creationTransaction.substring(0, 8)}...${contract.creationTransaction.substring(contract.creationTransaction.length - 6)}`}
              </Link>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Created At</div>
              <div className="font-medium">
                <TimeAgo timestamp={contract.createdAt} /> ({new Date(contract.createdAt).toLocaleString()})
              </div>
            </div>
            
            {contract.implementationAddress && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Implementation Address (Proxy)</div>
                <AddressDisplay
                  address={contract.implementationAddress}
                  networkType={contract.networkType}
                  truncate={false}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contract Source Code */}
      {contract.verified && contract.sourceCode && (
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Source Code</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Verified at: {contract.verifiedAt ? new Date(contract.verifiedAt).toLocaleString() : 'Unknown'}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
            <pre className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {contract.sourceCode}
            </pre>
          </div>
        </div>
      )}
      
      {/* Contract ABI */}
      {contract.verified && contract.abi && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contract ABI</h2>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
            <pre className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {JSON.stringify(contract.abi, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {/* Contract Bytecode */}
      {contract.bytecode && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Bytecode</h2>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
            <pre className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
              {contract.bytecode}
            </pre>
          </div>
        </div>
      )}
      
      {/* Transactions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Transactions
        </h2>
        
        <DataTable
          columns={[
            {
              header: 'Hash',
              accessor: (tx) => (
                <Link to={`/transactions/${tx.hash}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono">
                  {`${tx.hash.substring(0, 8)}...${tx.hash.substring(tx.hash.length - 6)}`}
                </Link>
              ),
            },
            {
              header: 'Block',
              accessor: (tx) => (
                <Link to={`/blocks/${tx.blockNumber}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                  {tx.blockNumber.toLocaleString()}
                </Link>
              ),
            },
            {
              header: 'Age',
              accessor: (tx) => <TimeAgo timestamp={tx.timestamp} />,
            },
            {
              header: 'From',
              accessor: (tx) => (
                <AddressDisplay
                  address={tx.from}
                  networkType={tx.networkType}
                  truncate={true}
                  className="text-sm"
                />
              ),
            },
            {
              header: 'Value',
              accessor: (tx) => `${tx.value} SEL`,
            },
            {
              header: 'Status',
              accessor: (tx) => <StatusBadge status={tx.status} />,
              className: 'text-center',
            },
          ]}
          data={transactionsData?.items || []}
          keyExtractor={(tx) => tx.id}
          isLoading={isLoadingTransactions}
          emptyMessage="No transactions found for this contract."
        />
        
        {transactionsData && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetails;

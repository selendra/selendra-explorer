import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount, useTransactions } from '../contexts/ApiContext';
import DataTable from '../components/data/DataTable';
import Pagination from '../components/ui/Pagination';
import TimeAgo from '../components/ui/TimeAgo';
import NetworkBadge from '../components/ui/NetworkBadge';
import StatusBadge from '../components/ui/StatusBadge';
import AddressDisplay from '../components/ui/AddressDisplay';
import { ClipboardIcon, QrCodeIcon, CubeIcon, ArrowsRightLeftIcon, BanknotesIcon, CodeBracketIcon, 
  ShieldCheckIcon, ListBulletIcon, TagIcon, DocumentTextIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const AccountDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { data: account, isLoading: isLoadingAccount, error } = useAccount(address || '');
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: transactionsData, isLoading: isLoadingTransactions } = useTransactions(page, pageSize, address);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQrCode, setShowQrCode] = useState(false);
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const totalPages = transactionsData ? Math.ceil(transactionsData.totalCount / pageSize) : 0;
  
  if (isLoadingAccount) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  if (error || !account) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Account Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          The account you are looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/accounts"
          className="mt-6 inline-block px-4 py-2 bg-gradient-to-r from-[#8C30F5] to-[#0CCBD6] text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C30F5]"
        >
          View All Accounts
        </Link>
      </div>
    );
  }

  // Function to copy address to clipboard
  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(account.address);
    // TODO: Add toast notification for clipboard copy
  };
  
  return (
    <div>
      {/* Account Header with Enhanced Design */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-[#8C30F5]/10 to-[#0CCBD6]/10 dark:from-[#8C30F5]/20 dark:to-[#0CCBD6]/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account</h1>
                <NetworkBadge type={account.networkType} />
                <span className={`px-2 py-1 text-xs rounded-full ${
                  account.type === 'eoa' 
                    ? 'bg-[#8C30F5]/10 text-[#8C30F5] dark:bg-[#8C30F5]/20 dark:text-[#9D50FF]' 
                    : 'bg-[#0CCBD6]/10 text-[#0CCBD6] dark:bg-[#0CCBD6]/20 dark:text-[#0EDAE6]'
                }`}>
                  {account.type === 'eoa' ? 'Wallet' : 'Contract'}
                </span>
              </div>
              
              <div className="flex items-center mt-3">
                <div className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">{account.address}</div>
                <div className="flex ml-2 space-x-1">
                  <button 
                    onClick={copyAddressToClipboard}
                    className="p-1 text-gray-500 hover:text-[#8C30F5] dark:text-gray-400 dark:hover:text-[#9D50FF] rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Copy Address"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setShowQrCode(!showQrCode)}
                    className="p-1 text-gray-500 hover:text-[#8C30F5] dark:text-gray-400 dark:hover:text-[#9D50FF] rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" 
                    title="Show QR Code"
                  >
                    <QrCodeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#8C30F5] to-[#0CCBD6] bg-clip-text text-transparent flex items-center">
                <img src="/sel/coin.png" alt="SEL" className="w-6 h-6 mr-2" />
                {account.balance} SEL
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ≈ ${(parseFloat(account.balance) * 0.01).toFixed(2)} USD
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Tab Navigation */}
        <div className="px-6">
          <nav className="flex space-x-6 overflow-x-auto">
            <button
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Overview
            </button>
            <button
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'transactions'
                  ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
              Transactions
            </button>
            <button
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'tokens'
                  ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('tokens')}
            >
              <TagIcon className="h-4 w-4 mr-2" />
              Tokens
            </button>
            {account.type === 'eoa' && (
              <button
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'stake'
                    ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('stake')}
              >
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Staking
              </button>
            )}
            {account.type !== 'eoa' && (
              <button
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === 'code'
                    ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('code')}
              >
                <CodeBracketIcon className="h-4 w-4 mr-2" />
                Contract
              </button>
            )}
            <button
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'analytics'
                  ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              <ListBulletIcon className="h-4 w-4 mr-2" />
              Analytics
            </button>
            <button
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === 'comments'
                  ? 'border-[#8C30F5] text-[#8C30F5] dark:border-[#9D50FF] dark:text-[#9D50FF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
              Comments
            </button>
          </nav>
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#8C30F5]/10 dark:bg-[#8C30F5]/20 mr-4">
                  <BanknotesIcon className="h-6 w-6 text-[#8C30F5] dark:text-[#9D50FF]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Balance</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <img src="/sel/coin.png" alt="SEL" className="w-5 h-5 mr-2" />
                    {account.balance} SEL
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#0CCBD6]/10 dark:bg-[#0CCBD6]/20 mr-4">
                  <ArrowsRightLeftIcon className="h-6 w-6 text-[#0CCBD6] dark:text-[#0EDAE6]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Transactions</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{account.transactionCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#8C30F5]/10 dark:bg-[#8C30F5]/20 mr-4">
                  <CubeIcon className="h-6 w-6 text-[#8C30F5] dark:text-[#9D50FF]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Nonce</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{account.nonce}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#0CCBD6]/10 dark:bg-[#0CCBD6]/20 mr-4">
                  <CodeBracketIcon className="h-6 w-6 text-[#0CCBD6] dark:text-[#0EDAE6]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Type</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {account.type === 'eoa' ? 'Wallet' : 'Contract'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Details</h2>
            </div>
            
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">
                    {account.address}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Balance</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                    <img src="/sel/coin.png" alt="SEL" className="w-4 h-4 mr-1.5" />
                    {account.balance} SEL (≈ ${(parseFloat(account.balance) * 0.01).toFixed(2)} USD)
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Network Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                    {account.networkType}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Account Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                    {account.type === 'eoa' ? 'Externally Owned Account' : 'Contract Account'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Transaction Count</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {account.transactionCount.toLocaleString()}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Nonce</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {account.nonce}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">First Transaction</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(account.createdAt).toLocaleString()}
                  </dd>
                </div>
                
              </dl>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
              >
                View All
              </button>
            </div>
            
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
                  header: 'From/To',
                  accessor: (tx) => (
                    <div>
                      {tx.from === account.address ? (
                        <div className="flex items-center">
                          <span className="text-red-500 dark:text-red-400 mr-2">OUT</span>
                          <span className="text-gray-500 dark:text-gray-400 mr-1">To:</span>
                          {tx.to ? (
                            <AddressDisplay
                              address={tx.to}
                              networkType={tx.networkType}
                              truncate={true}
                              className="text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">Contract Creation</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-green-500 dark:text-green-400 mr-2">IN</span>
                          <span className="text-gray-500 dark:text-gray-400 mr-1">From:</span>
                          <AddressDisplay
                            address={tx.from}
                            networkType={tx.networkType}
                            truncate={true}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  header: 'Value',
                  accessor: (tx) => (
                    <div className="flex items-center">
                      <img src="/sel/coin.png" alt="SEL" className="w-4 h-4 mr-1.5" />
                      <span>{tx.value} SEL</span>
                    </div>
                  ),
                },
                {
                  header: 'Status',
                  accessor: (tx) => <StatusBadge status={tx.status} />,
                  className: 'text-center',
                },
              ]}
              data={transactionsData?.items ? transactionsData.items.slice(0, 5) : []}
              keyExtractor={(tx) => tx.id}
              isLoading={isLoadingTransactions}
              emptyMessage="No transactions found for this account."
            />
          </div>
        </div>
      )}
      
      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transactions</h2>
          </div>
          
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
                header: 'From/To',
                accessor: (tx) => (
                  <div>
                    {tx.from === account.address ? (
                      <div className="flex items-center">
                        <span className="text-red-500 dark:text-red-400 mr-2">OUT</span>
                        <span className="text-gray-500 dark:text-gray-400 mr-1">To:</span>
                        {tx.to ? (
                          <AddressDisplay
                            address={tx.to}
                            networkType={tx.networkType}
                            truncate={true}
                            className="text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 italic">Contract Creation</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">IN</span>
                        <span className="text-gray-500 dark:text-gray-400 mr-1">From:</span>
                        <AddressDisplay
                          address={tx.from}
                          networkType={tx.networkType}
                          truncate={true}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                ),
              },
              {
                header: 'Value',
                accessor: (tx) => (
                  <div className="flex items-center">
                    <img src="/sel/coin.png" alt="SEL" className="w-4 h-4 mr-1.5" />
                    <span>{tx.value} SEL</span>
                  </div>
                ),
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
            emptyMessage="No transactions found for this account."
          />
          
          {transactionsData && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Tokens Tab */}
      {activeTab === 'tokens' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Token Balances</h2>
          </div>
          
          {account.tokens && account.tokens.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Token
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Balance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value (USD)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contract Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {account.tokens.map((token, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={`https://via.placeholder.com/32?text=${token.tokenSymbol.charAt(0)}`}
                            alt={token.tokenSymbol}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div>
                            <Link to={`/tokens/${token.tokenAddress}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                              {token.tokenName}
                            </Link>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {token.tokenSymbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {token.balance}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${(parseFloat(token.balance) * 0.01).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/tokens/${token.tokenAddress}`} className="text-primary-600 dark:text-primary-400 hover:underline font-mono">
                          {`${token.tokenAddress.substring(0, 8)}...${token.tokenAddress.substring(token.tokenAddress.length - 6)}`}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No token balances found for this account.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Contract Code Tab */}
      {activeTab === 'code' && account.type !== 'eoa' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contract Information</h2>
            </div>
            
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-y-4">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Contract Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">
                    {account.address}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Contract Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {account.networkType === 'evm' ? 'EVM Smart Contract' : 'Wasm Smart Contract'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Creator</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    Unknown
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(account.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Contract Code */}
          {account.code && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contract Code</h2>
              </div>
              
              <div className="p-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                  <pre className="font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                    {account.code}
                  </pre>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-right">
                <Link to={`/contracts/${account.address}`} className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium">
                  View Full Contract Details →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDetails;

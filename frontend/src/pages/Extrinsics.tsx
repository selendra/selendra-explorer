import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowsRightLeftIcon, 
  ChevronRightIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import IdentityBadge from '../components/identity/IdentityBadge';
import { formatDistance } from 'date-fns';

// Mock data - would be replaced with real data from the API
const mockExtrinsics = Array.from({ length: 20 }, (_, i) => ({
  id: `extrinsic-${i}`,
  extrinsic_hash: `0x${Math.random().toString(16).substring(2, 64)}`,
  block_number: 12345678 - i,
  timestamp: new Date(Date.now() - i * 60000).toISOString(),
  sender: `5${Math.random().toString(16).substring(2, 45)}`,
  action: ['balances.transfer', 'staking.bond', 'utility.batch', 'system.remark', 'identity.setIdentity'][
    Math.floor(Math.random() * 5)
  ],
  nonce: Math.floor(Math.random() * 1000),
  result: Math.random() > 0.2,
  parameters: JSON.stringify({ amount: '1000000000000000000', dest: '5GTG4...' }),
  signature: `0x${Math.random().toString(16).substring(2, 64)}`,
  fee: `${(Math.random() * 0.01).toFixed(6)}`,
  events: [],
}));

// Mock identities for some addresses
const mockIdentities = {
  [mockExtrinsics[0].sender]: { id: '1', name: 'Alice', sel_domain: 'alice.sel' },
  [mockExtrinsics[1].sender]: { id: '2', name: 'Bob', sel_domain: 'bob.sel' },
  [mockExtrinsics[2].sender]: { id: '3', name: 'Charlie', sel_domain: 'charlie.sel' },
};

const Extrinsics: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  // Filter options
  const sections = Array.from(new Set(mockExtrinsics.map(ex => ex.action.split('.')[0])));
  const actions = Array.from(new Set(mockExtrinsics.map(ex => ex.action)));
  
  // Filter extrinsics based on selected filters
  const filteredExtrinsics = mockExtrinsics.filter(ex => {
    if (selectedSection && !ex.action.startsWith(selectedSection)) return false;
    if (selectedAction && ex.action !== selectedAction) return false;
    return true;
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <ArrowsRightLeftIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
            Substrate Extrinsics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and explore Substrate extrinsics on the Selendra blockchain
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
            Filters
          </button>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Section
            </label>
            <select
              value={selectedSection || ''}
              onChange={(e) => setSelectedSection(e.target.value || null)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm w-40"
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action
            </label>
            <select
              value={selectedAction || ''}
              onChange={(e) => setSelectedAction(e.target.value || null)}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm w-48"
            >
              <option value="">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Extrinsics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Extrinsic Hash
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Block
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sender
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExtrinsics.map((extrinsic) => (
                <tr key={extrinsic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/extrinsics/${extrinsic.extrinsic_hash}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm"
                    >
                      {`${extrinsic.extrinsic_hash.slice(0, 8)}...${extrinsic.extrinsic_hash.slice(-6)}`}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/blocks/${extrinsic.block_number}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {extrinsic.block_number.toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDistance(new Date(extrinsic.timestamp), new Date(), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {extrinsic.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <IdentityBadge 
                      address={extrinsic.sender} 
                      identity={mockIdentities[extrinsic.sender]}
                      showFullInfo
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {extrinsic.fee} SEL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {extrinsic.result ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <XCircleIcon className="h-4 w-4 mr-1.5" />
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">20</span> of{' '}
                <span className="font-medium">1,234</span> extrinsics
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                </a>
                {/* Current: "z-10 bg-primary-50 border-primary-500 text-primary-600", Default: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" */}
                <a
                  href="#"
                  aria-current="page"
                  className="z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-400 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </a>
                <a
                  href="#"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  2
                </a>
                <a
                  href="#"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  3
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" />
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Extrinsics; 
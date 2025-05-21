import React, { useState } from 'react';
import { BookmarkIcon, DocumentTextIcon, ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// Mock data for demo purposes
const mockSavedContracts = [
  {
    id: '1',
    name: 'Selendra DEX',
    address: '0x3a1e9c76D078F270152Fd23ca787fc7fBc2e4d82',
    type: 'evm',
    addedOn: '2023-07-15T10:32:45.000Z',
    notes: 'Main DEX contract for token swaps',
    tags: ['defi', 'dex']
  },
  {
    id: '2',
    name: 'SEL Token',
    address: '0x6b3e9c76D078F270152Fd23ca787fc7fBc2e1a36',
    type: 'evm',
    addedOn: '2023-07-10T14:22:12.000Z',
    notes: 'Native token contract',
    tags: ['token', 'erc20']
  },
  {
    id: '3',
    name: 'NFT Marketplace',
    address: '0x9c4e8c76D078F270152Fd23ca787fc7fBc2e3b42',
    type: 'evm',
    addedOn: '2023-07-05T09:17:33.000Z',
    notes: 'Marketplace for trading NFTs',
    tags: ['nft', 'marketplace']
  },
  {
    id: '4',
    name: 'Staking Contract',
    address: '5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX',
    type: 'wasm',
    addedOn: '2023-06-28T16:45:19.000Z',
    notes: 'Substrate staking implementation',
    tags: ['staking', 'wasm']
  }
];

const Favorites: React.FC = () => {
  const [savedContracts, setSavedContracts] = useState(mockSavedContracts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'evm' | 'wasm'>('all');
  
  // Filter contracts based on search term and type
  const filteredContracts = savedContracts.filter(contract => {
    const matchesSearch = 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesType = filterType === 'all' || contract.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Function to remove a contract from saved list
  const removeContract = (id: string) => {
    setSavedContracts(prevContracts => prevContracts.filter(contract => contract.id !== id));
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <BookmarkIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
          Saved Contracts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          Your collection of saved smart contracts for quick access
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search by name, address, notes or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filterType === 'all'
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('evm')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filterType === 'evm'
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600`}
            >
              EVM
            </button>
            <button
              onClick={() => setFilterType('wasm')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filterType === 'wasm'
                  ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600`}
            >
              Wasm
            </button>
          </div>
        </div>
      </div>
      
      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">No saved contracts found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start by adding contracts to your saved list'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredContracts.map((contract) => (
              <li key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <DocumentTextIcon className="h-6 w-6 mr-3 text-gray-500 dark:text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {contract.name}
                      </h3>
                      <span className={`ml-3 text-xs font-medium px-2 py-1 rounded-full ${
                        contract.type === 'evm' 
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400'
                      }`}>
                        {contract.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-4">
                        Added: {formatDate(contract.addedOn)}
                      </span>
                      <button
                        onClick={() => removeContract(contract.id)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        aria-label="Remove contract"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="text-gray-500 dark:text-gray-500">Address: </span>
                      <span className="font-mono">{contract.address}</span>
                    </p>
                    {contract.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-gray-500 dark:text-gray-500">Notes: </span>
                        {contract.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {contract.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link 
                      to={`/contracts/${contract.address}`}
                      className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      View Contract
                      <ChevronRightIcon className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Add New Contract Section */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6 border border-primary-100 dark:border-primary-900/30">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Add New Contract</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
              Save any contract from the explorer for quick access later. You can also add personal notes and tags.
            </p>
          </div>
          <Link
            to="/contracts"
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-md hover:opacity-90 shadow-sm"
          >
            Browse Contracts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Favorites; 
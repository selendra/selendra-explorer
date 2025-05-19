import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import axios from 'axios';

interface SavedContract {
  id: number;
  contract_address: string;
  contract_name?: string;
  contract_type: string;
  list_name: string;
  notes?: string;
  created_at: string;
}

interface SavedCode {
  id: number;
  code_name: string;
  code_content: string;
  language: string;
  created_at: string;
  updated_at: string;
}

const MyContracts: React.FC = () => {
  const { isConnected, address, sessionToken } = useWallet();
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [savedCode, setSavedCode] = useState<SavedCode[]>([]);
  const [contractLists, setContractLists] = useState<string[]>([]);
  const [activeList, setActiveList] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'contracts' | 'code'>('contracts');

  // Redirect if not connected
  if (!isConnected || !address || !sessionToken) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch saved contracts
        const contractsResponse = await axios.get('/api/saved/contracts', {
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
        
        setSavedContracts(contractsResponse.data.contracts);
        setContractLists(['All', ...contractsResponse.data.lists]);
        
        // Fetch saved code
        const codeResponse = await axios.get('/api/saved/code', {
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
        
        setSavedCode(codeResponse.data.codes);
      } catch (error) {
        console.error('Failed to fetch saved items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address, sessionToken]);

  const handleRemoveContract = async (id: number) => {
    try {
      await axios.delete(`/api/saved/contracts/${id}`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      
      // Update the list after deletion
      setSavedContracts(savedContracts.filter(contract => contract.id !== id));
    } catch (error) {
      console.error('Failed to remove contract:', error);
    }
  };

  const handleRemoveCode = async (id: number) => {
    try {
      await axios.delete(`/api/saved/code/${id}`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      
      // Update the list after deletion
      setSavedCode(savedCode.filter(code => code.id !== id));
    } catch (error) {
      console.error('Failed to remove code:', error);
    }
  };

  const filteredContracts = activeList === 'All'
    ? savedContracts
    : savedContracts.filter(contract => contract.list_name === activeList);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Contracts & Code</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'contracts'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('contracts')}
        >
          Saved Contracts
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'code'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('code')}
        >
          Saved Code
        </button>
      </div>

      {activeTab === 'contracts' ? (
        <>
          {/* Contract Lists */}
          <div className="flex flex-wrap gap-2 mb-4">
            {contractLists.map((list) => (
              <button
                key={list}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeList === list
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveList(list)}
              >
                {list}
              </button>
            ))}
          </div>

          {/* Saved Contracts */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              {activeList === 'All' ? 'All Saved Contracts' : `Contracts in "${activeList}"`}
            </h2>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : filteredContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contract
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        List
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Added
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium">
                                {contract.contract_name || formatAddress(contract.contract_address)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {contract.contract_address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            contract.contract_type === 'evm' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {contract.contract_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {contract.list_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatTimestamp(contract.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/contracts/${contract.contract_address}`} className="text-primary-600 hover:text-primary-900 mr-3">
                            View
                          </Link>
                          <button 
                            onClick={() => handleRemoveContract(contract.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No saved contracts found.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Saved Code */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Saved Code</h2>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : savedCode.length > 0 ? (
              <div className="space-y-4">
                {savedCode.map((code) => (
                  <div key={code.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium">{code.code_name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {code.language} • Last updated: {formatTimestamp(code.updated_at)}
                        </p>
                      </div>
                      <div>
                        <button 
                          onClick={() => handleRemoveCode(code.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm">
                        <code>{code.code_content.length > 200 
                          ? `${code.code_content.substring(0, 200)}...` 
                          : code.code_content}
                        </code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No saved code found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyContracts;

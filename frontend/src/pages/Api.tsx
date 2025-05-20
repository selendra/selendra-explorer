import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Api: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const handleCopy = (endpoint: string) => {
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const toggleEndpoint = (id: string) => {
    if (expandedEndpoint === id) {
      setExpandedEndpoint(null);
    } else {
      setExpandedEndpoint(id);
    }
  };

  // Filter endpoints by search term and category
  const getFilteredEndpoints = () => {
    return endpoints.filter(endpoint => {
      const matchesSearch = searchTerm === '' || 
        endpoint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endpoint.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || endpoint.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredEndpoints = getFilteredEndpoints();

  // Sample API endpoints
  const endpoints = [
    {
      id: 'get-blocks',
      title: 'Get Blocks',
      endpoint: 'https://api.selendra.org/v1/blocks',
      method: 'GET',
      category: 'blocks',
      params: [
        { name: 'limit', type: 'number', description: 'Limit the number of results (default: 25, max: 100)' },
        { name: 'page', type: 'number', description: 'Page number for pagination (starts at 1)' },
      ],
      description: 'Returns a list of the most recent blocks in the Selendra blockchain',
      response: `{
  "status": "success",
  "data": [
    {
      "number": 3456789,
      "hash": "0x8f5bab218b6bb34476f51ca588e9f4553a3a7ce5e13a66c660a15cc2c8973967",
      "timestamp": "2023-06-15T10:32:45.000Z",
      "parentHash": "0x7d5b6d85654b2a4bd33a9b22ccb3e434c8a8a4e5d67b54c8a3c5e387c98d0123",
      "size": 43249,
      "gasUsed": "3245982",
      "gasLimit": "15000000",
      "transactions": 53,
      "miner": "0x7a3e9c76D078F270152Fd23ca787fc7fBc2e7594",
      "difficulty": "2",
      "totalDifficulty": "3456791"
    },
    // ... more blocks
  ],
  "meta": {
    "total": 3456789,
    "page": 1,
    "limit": 25
  }
}`
    },
    {
      id: 'get-block',
      title: 'Get Block Details',
      endpoint: 'https://api.selendra.org/v1/blocks/{blockId}',
      method: 'GET',
      category: 'blocks',
      params: [
        { name: 'blockId', type: 'string', description: 'Block number or hash' },
      ],
      description: 'Returns detailed information about a specific block',
      response: `{
  "status": "success",
  "data": {
    "number": 3456789,
    "hash": "0x8f5bab218b6bb34476f51ca588e9f4553a3a7ce5e13a66c660a15cc2c8973967",
    "timestamp": "2023-06-15T10:32:45.000Z",
    "parentHash": "0x7d5b6d85654b2a4bd33a9b22ccb3e434c8a8a4e5d67b54c8a3c5e387c98d0123",
    "size": 43249,
    "gasUsed": "3245982",
    "gasLimit": "15000000",
    "transactions": [
      {
        "hash": "0x1d3f7bd4a25827ce2d75fd471483fac9e207342a9b0e76248132cb24d4d9ac3a",
        "from": "0x3a1e9c76D078F270152Fd23ca787fc7fBc2e4d82",
        "to": "0x6b3e9c76D078F270152Fd23ca787fc7fBc2e1a36",
        "value": "1000000000000000000",
        "gasUsed": "21000",
        "status": 1
      },
      // ... more transactions
    ],
    "miner": "0x7a3e9c76D078F270152Fd23ca787fc7fBc2e7594",
    "difficulty": "2",
    "totalDifficulty": "3456791",
    "extraData": "0x",
    "stateRoot": "0x1f3a6d12b69c012ff4fcdf33f1d0af00ff3a4c4f2123ded3a10c1a83dc6e9a91",
    "receiptsRoot": "0x2a5b8f4a37b6fa19da42b7d5e7f5b6f5c4a3a9c4f2a1d5e6b8d9c7a3b5d7e8f9a",
    "transactionsRoot": "0x2e5a7c4f3d6b8a9c1e2d3f4a5b6c7d8e9f1a2b3c4d5e6f7a8b9c1d2e3f4a5b6c"
  }
}`
    },
    {
      id: 'get-txs',
      title: 'Get Transactions',
      endpoint: 'https://api.selendra.org/v1/transactions',
      method: 'GET',
      category: 'transactions',
      params: [
        { name: 'limit', type: 'number', description: 'Limit the number of results (default: 25, max: 100)' },
        { name: 'page', type: 'number', description: 'Page number for pagination (starts at 1)' },
        { name: 'address', type: 'string', description: 'Filter by address (sender or receiver)' },
        { name: 'block', type: 'string', description: 'Filter by block number or hash' },
      ],
      description: 'Returns a list of the most recent transactions in the Selendra blockchain',
      response: `{
  "status": "success",
  "data": [
    {
      "hash": "0x1d3f7bd4a25827ce2d75fd471483fac9e207342a9b0e76248132cb24d4d9ac3a",
      "block": 3456789,
      "timestamp": "2023-06-15T10:32:45.000Z",
      "from": "0x3a1e9c76D078F270152Fd23ca787fc7fBc2e4d82",
      "to": "0x6b3e9c76D078F270152Fd23ca787fc7fBc2e1a36",
      "value": "1000000000000000000",
      "gasUsed": "21000",
      "gasPrice": "5000000000",
      "status": 1,
      "type": "evm"
    },
    // ... more transactions
  ],
  "meta": {
    "total": 5678123,
    "page": 1,
    "limit": 25
  }
}`
    },
    {
      id: 'get-tx',
      title: 'Get Transaction Details',
      endpoint: 'https://api.selendra.org/v1/transactions/{txHash}',
      method: 'GET',
      category: 'transactions',
      params: [
        { name: 'txHash', type: 'string', description: 'Transaction hash' },
      ],
      description: 'Returns detailed information about a specific transaction',
      response: `{
  "status": "success",
  "data": {
    "hash": "0x1d3f7bd4a25827ce2d75fd471483fac9e207342a9b0e76248132cb24d4d9ac3a",
    "block": 3456789,
    "blockHash": "0x8f5bab218b6bb34476f51ca588e9f4553a3a7ce5e13a66c660a15cc2c8973967",
    "timestamp": "2023-06-15T10:32:45.000Z",
    "from": "0x3a1e9c76D078F270152Fd23ca787fc7fBc2e4d82",
    "to": "0x6b3e9c76D078F270152Fd23ca787fc7fBc2e1a36",
    "value": "1000000000000000000",
    "gasUsed": "21000",
    "gasPrice": "5000000000",
    "fee": "105000000000000",
    "nonce": 42,
    "status": 1,
    "input": "0x",
    "type": "evm",
    "logs": [
      // transaction logs
    ],
    "receipt": {
      // transaction receipt details
    }
  }
}`
    },
    {
      id: 'get-accounts',
      title: 'Get Accounts',
      endpoint: 'https://api.selendra.org/v1/accounts',
      method: 'GET',
      category: 'accounts',
      params: [
        { name: 'limit', type: 'number', description: 'Limit the number of results (default: 25, max: 100)' },
        { name: 'page', type: 'number', description: 'Page number for pagination (starts at 1)' },
        { name: 'sort', type: 'string', description: 'Sort by balance (asc or desc)' },
      ],
      description: 'Returns a list of the top accounts by balance',
      response: `{
  "status": "success",
  "data": [
    {
      "address": "0x3a1e9c76D078F270152Fd23ca787fc7fBc2e4d82",
      "balance": "15324513000000000000000",
      "txCount": 152,
      "type": "eoa",
      "firstSeen": "2023-01-15T10:32:45.000Z"
    },
    // ... more accounts
  ],
  "meta": {
    "total": 45632,
    "page": 1,
    "limit": 25
  }
}`
    },
    {
      id: 'get-account',
      title: 'Get Account Details',
      endpoint: 'https://api.selendra.org/v1/accounts/{address}',
      method: 'GET',
      category: 'accounts',
      params: [
        { name: 'address', type: 'string', description: 'Account address' },
      ],
      description: 'Returns detailed information about a specific account',
      response: `{
  "status": "success",
  "data": {
    "address": "0x3a1e9c76D078F270152Fd23ca787fc7fBc2e4d82",
    "balance": "15324513000000000000000",
    "txCount": 152,
    "type": "eoa",
    "firstSeen": "2023-01-15T10:32:45.000Z",
    "tokens": [
      {
        "address": "0x1a2b3c4d5e6f7a8b9c1d2e3f4a5b6c7d8e9f1a2b",
        "symbol": "USDT",
        "name": "Tether USD",
        "decimals": 18,
        "balance": "5000000000000000000000"
      },
      // ... more tokens
    ]
  }
}`
    },
    {
      id: 'get-contracts',
      title: 'Get Contracts',
      endpoint: 'https://api.selendra.org/v1/contracts',
      method: 'GET',
      category: 'contracts',
      params: [
        { name: 'limit', type: 'number', description: 'Limit the number of results (default: 25, max: 100)' },
        { name: 'page', type: 'number', description: 'Page number for pagination (starts at 1)' },
        { name: 'type', type: 'string', description: 'Filter by contract type (evm or wasm)' },
      ],
      description: 'Returns a list of verified contracts on the Selendra blockchain',
      response: `{
  "status": "success",
  "data": [
    {
      "address": "0x6b3e9c76D078F270152Fd23ca787fc7fBc2e1a36",
      "name": "Selendra DEX",
      "type": "evm",
      "txCount": 15243,
      "verified": true,
      "createdAt": "2023-02-15T10:32:45.000Z",
      "creator": "0x3a1e9c76D078F270152Fd23ca787fc7fBc2e4d82"
    },
    // ... more contracts
  ],
  "meta": {
    "total": 1243,
    "page": 1,
    "limit": 25
  }
}`
    },
    {
      id: 'get-contract',
      title: 'Get Contract Details',
      endpoint: 'https://api.selendra.org/v1/contracts/{address}',
      method: 'GET',
      category: 'contracts',
      params: [
        { name: 'address', type: 'string', description: 'Contract address' },
      ],
      description: 'Returns detailed information about a specific contract',
      response: `{
  "status": "success",
  "data": {
    "address": "0x6b3e9c76D078F270152Fd23ca787fc7fBc2e1a36",
    "name": "Selendra DEX",
    "type": "evm",
    "txCount": 15243,
    "balance": "423500000000000000000",
    "verified": true,
    "createdAt": "2023-02-15T10:32:45.000Z",
    "creator": "0x3a1e9c76D078F270152Fd23ca787fc7fBc2e4d82",
    "sourcecode": "// Contract source code if verified",
    "abi": [
      // Contract ABI if verified
    ]
  }
}`
    },
  ];

  const categories = [
    { id: 'all', name: 'All Endpoints' },
    { id: 'blocks', name: 'Blocks' },
    { id: 'transactions', name: 'Transactions' },
    { id: 'accounts', name: 'Accounts' },
    { id: 'contracts', name: 'Contracts' }
  ];

  // Generate endpoint colors based on method
  const getMethodColors = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PUT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
          Selendra Explorer API
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Access Selendra blockchain data programmatically through our REST API
        </p>
      </motion.div>

      {/* API Overview */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-10 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Overview</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The Selendra Explorer API provides developers with programmatic access to Selendra blockchain data.
          Use this API to fetch information about blocks, transactions, accounts, contracts, and more.
        </p>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Base URL</h3>
        <motion.div 
          whileHover={{ scale: 1.01 }} 
          className="flex items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700 mb-4"
        >
          <code className="text-primary-600 dark:text-primary-400 flex-grow font-mono text-sm">
            https://api.selendra.org/v1
          </code>
          <CopyToClipboard text="https://api.selendra.org/v1" onCopy={() => handleCopy("base-url")}>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {copiedEndpoint === "base-url" ? (
                <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5" />
              )}
            </motion.button>
          </CopyToClipboard>
        </motion.div>

        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Authentication</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Public endpoints do not require authentication. However, rate limits apply. 
          For higher rate limits, consider signing up for an API key.
        </p>

        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Rate Limits</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          <span className="font-medium">Public access:</span> 100 requests per minute<br />
          <span className="font-medium">With API key:</span> 1,000 requests per minute
        </p>

        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Response Format</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          All API responses are returned in JSON format with the following structure:
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700 mb-4">
          <pre className="text-sm font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
{`{
  "status": "success",
  "data": { ... },
  "meta": { ... }
}`}
          </pre>
        </div>

        <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Error Handling</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          In case of an error, the response will contain an error message and appropriate HTTP status code:
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
          <pre className="text-sm font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
{`{
  "status": "error",
  "message": "Error message",
  "code": "ERROR_CODE"
}`}
          </pre>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Endpoints */}
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          API Endpoints
          <span className="ml-2 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 px-2 py-0.5 rounded-full">
            {filteredEndpoints.length} {filteredEndpoints.length === 1 ? 'endpoint' : 'endpoints'}
          </span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Browse and explore the available API endpoints for the Selendra Explorer
        </p>
      </motion.div>
      
      <motion.div variants={containerVariants} className="space-y-6">
        {filteredEndpoints.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-600 dark:text-gray-400">No endpoints match your search criteria</p>
          </motion.div>
        ) : (
          filteredEndpoints.map((endpoint) => (
            <motion.div 
              key={endpoint.id} 
              id={endpoint.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div 
                className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                onClick={() => toggleEndpoint(endpoint.id)}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mr-3 ${getMethodColors(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  {endpoint.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded hidden sm:inline-block">
                    {endpoint.category}
                  </span>
                  {expandedEndpoint === endpoint.id ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedEndpoint === endpoint.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-4"
                >
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{endpoint.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Endpoint</h4>
                    <div className="flex items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                      <code className="text-primary-600 dark:text-primary-400 flex-grow font-mono text-sm overflow-x-auto">
                        {endpoint.endpoint}
                      </code>
                      <CopyToClipboard text={endpoint.endpoint} onCopy={() => handleCopy(endpoint.id)}>
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.95 }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2"
                        >
                          {copiedEndpoint === endpoint.id ? (
                            <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="h-5 w-5" />
                          )}
                        </motion.button>
                      </CopyToClipboard>
                    </div>
                  </div>
                  
                  {endpoint.params.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Parameters</h4>
                      <div className="overflow-x-auto bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900">
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {endpoint.params.map((param, index) => (
                              <tr key={index} className="bg-white dark:bg-gray-800">
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">{param.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{param.type}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Example Response</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                      <pre className="text-sm font-mono text-gray-800 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                        {endpoint.response}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      {/* SDKs and Libraries */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-10 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">SDKs & Libraries</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          To simplify API integration, we provide official client libraries for popular programming languages:
        </p>
        
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { name: 'JavaScript/TypeScript', description: 'Official NPM package for Node.js and browser' },
            { name: 'Python', description: 'Python client library available on PyPI' },
            { name: 'Rust', description: 'Rust crate for native performance' }
          ].map((sdk, index) => (
            <motion.a 
              key={index}
              href="#"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">{sdk.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{sdk.description}</p>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* Get API Key */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6 mt-10 border border-primary-200 dark:border-primary-900"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Your API Key</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Sign up for an API key to access higher rate limits and premium features.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-md hover:opacity-90 shadow-md transition-opacity"
          >
            Register for API Access
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Api; 
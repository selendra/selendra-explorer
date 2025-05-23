import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

const Api: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <CodeBracketIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
          API Documentation
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          Access Selendra blockchain data programmatically using our comprehensive API
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The Selendra Explorer API provides access to blockchain data including blocks, transactions, accounts, contracts, and more.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4">
          <p className="text-sm font-mono mb-2 text-gray-700 dark:text-gray-300">Base URL:</p>
          <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-primary-600 dark:text-primary-400 text-sm font-mono">
            https://api.explorer.selendra.org/v1
          </code>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Endpoints</h2>
        
        {/* Blocks Endpoints */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Blocks</h3>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-md mb-4">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 mr-3">GET</span>
                <code className="font-mono text-sm">/blocks</code>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Get a list of recent blocks</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Parameters:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-4">
                <li><code className="font-mono">page</code>: Page number (default: 1)</li>
                <li><code className="font-mono">limit</code>: Number of items per page (default: 25, max: 100)</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 mr-3">GET</span>
                <code className="font-mono text-sm">/blocks/:blockNumberOrHash</code>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Get details for a specific block</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Path Parameters:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-4">
                <li><code className="font-mono">blockNumberOrHash</code>: Block number or block hash</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Transactions Endpoints */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Transactions</h3>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-md mb-4">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 mr-3">GET</span>
                <code className="font-mono text-sm">/transactions</code>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Get a list of recent transactions</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Parameters:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-4">
                <li><code className="font-mono">page</code>: Page number (default: 1)</li>
                <li><code className="font-mono">limit</code>: Number of items per page (default: 25, max: 100)</li>
                <li><code className="font-mono">type</code>: Filter by transaction type (evm, substrate)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rate Limits</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The API is rate limited to prevent abuse. Unauthenticated requests are limited to 100 requests per minute.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          For higher rate limits, please contact our team to discuss API access plans.
        </p>
      </div>
    </div>
  );
};

export default Api; 
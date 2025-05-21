import React, { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const VerifyContract: React.FC = () => {
  const [contractType, setContractType] = useState<'evm' | 'wasm'>('evm');
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <ShieldCheckIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
          Verify Smart Contract
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          Verify and publish your contract's source code on Selendra Explorer
        </p>
      </div>

      {/* Contract Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contract Type</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Select the type of contract you want to verify
        </p>

        <div className="flex space-x-4 mb-2">
          <button
            onClick={() => setContractType('evm')}
            className={`px-6 py-3 rounded-md flex items-center ${
              contractType === 'evm'
                ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:border-primary-400 dark:text-primary-400'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            } border`}
          >
            <span className="font-medium">EVM Contract</span>
            {contractType === 'evm' && (
              <span className="ml-2 h-2 w-2 rounded-full bg-primary-500 dark:bg-primary-400"></span>
            )}
          </button>
          
          <button
            onClick={() => setContractType('wasm')}
            className={`px-6 py-3 rounded-md flex items-center ${
              contractType === 'wasm'
                ? 'bg-secondary-50 border-secondary-500 text-secondary-700 dark:bg-secondary-900/20 dark:border-secondary-400 dark:text-secondary-400'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            } border`}
          >
            <span className="font-medium">Wasm Contract</span>
            {contractType === 'wasm' && (
              <span className="ml-2 h-2 w-2 rounded-full bg-secondary-500 dark:bg-secondary-400"></span>
            )}
          </button>
        </div>
      </div>

      {/* Verification Form - EVM */}
      {contractType === 'evm' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Verify EVM Contract</h2>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="contract-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Address
              </label>
              <input
                type="text"
                id="contract-address"
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The address where the contract is deployed
              </p>
            </div>
            
            <div>
              <label htmlFor="contract-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Name
              </label>
              <input
                type="text"
                id="contract-name"
                placeholder="MyToken"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="compiler-version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Compiler Version
              </label>
              <select
                id="compiler-version"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Select Compiler Version --</option>
                <option value="v0.8.18">v0.8.18</option>
                <option value="v0.8.17">v0.8.17</option>
                <option value="v0.8.16">v0.8.16</option>
                <option value="v0.8.15">v0.8.15</option>
                <option value="v0.8.14">v0.8.14</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="optimization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Optimization
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input type="radio" name="optimization" value="yes" className="h-4 w-4 text-primary-600" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="optimization" value="no" className="h-4 w-4 text-primary-600" defaultChecked />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">No</span>
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="source-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Code
              </label>
              <textarea
                id="source-code"
                rows={10}
                placeholder="// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    // Paste your contract source code here
}"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="constructor-arguments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Constructor Arguments ABI-encoded (Optional)
              </label>
              <input
                type="text"
                id="constructor-arguments"
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ABI-encoded constructor arguments used to deploy the contract
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
              >
                Verify Contract
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verification Form - Wasm */}
      {contractType === 'wasm' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Verify Wasm Contract</h2>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="contract-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Address
              </label>
              <input
                type="text"
                id="contract-address"
                placeholder="5..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The address where the contract is deployed
              </p>
            </div>
            
            <div>
              <label htmlFor="contract-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Name
              </label>
              <input
                type="text"
                id="contract-name"
                placeholder="my_contract"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="wasm-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Wasm File
              </label>
              <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none"
                    >
                      <span>Upload .wasm file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Compiled .wasm file
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="metadata-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Metadata File
              </label>
              <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="metadata-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none"
                    >
                      <span>Upload metadata.json</span>
                      <input id="metadata-upload" name="metadata-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Contract metadata.json file
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
              >
                Verify Contract
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VerifyContract; 
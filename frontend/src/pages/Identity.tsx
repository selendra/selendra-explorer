import React from 'react';
import { Link } from 'react-router-dom';
import { 
  IdentificationIcon, 
  UserCircleIcon, 
  DocumentTextIcon, 
  ArrowRightIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const Identity: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <IdentificationIcon className="h-8 w-8 mr-3 text-primary-500 dark:text-primary-400" />
          Selendra Identity
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          Selendra identity system allows users to register and verify their identities on-chain, 
          creating a web of trust that enhances security and usability.
        </p>
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* On-chain Identity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
          <div className="text-primary-600 dark:text-primary-400 p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg inline-block mb-4">
            <IdentificationIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">On-chain Identity</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Register your identity directly on the Selendra blockchain, including name, email, website, and social media handles.
          </p>
          <Link 
            to="/identity/register" 
            className="text-primary-600 dark:text-primary-400 flex items-center font-medium hover:underline"
          >
            Register Identity <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {/* .sel Domains */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
          <div className="text-primary-600 dark:text-primary-400 p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg inline-block mb-4">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">.sel Domains</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Register a human-readable .sel domain name that maps to your account address, making it easier to share and remember.
          </p>
          <Link 
            to="/domains" 
            className="text-primary-600 dark:text-primary-400 flex items-center font-medium hover:underline"
          >
            Browse Domains <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {/* Verification */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300">
          <div className="text-primary-600 dark:text-primary-400 p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg inline-block mb-4">
            <CheckBadgeIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Identity Verification</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get your identity verified by registrars to increase trust and enable additional features in the Selendra ecosystem.
          </p>
          <Link 
            to="/identity/verification" 
            className="text-primary-600 dark:text-primary-400 flex items-center font-medium hover:underline"
          >
            Verification Process <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">How Identity Works on Selendra</h2>
        
        <div className="space-y-6">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 mr-4">
              1
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Register Basic Info</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Users can register their name, email, website, Twitter, and other social accounts directly on the Selendra blockchain.
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 mr-4">
              2
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Secure a .sel Domain (Optional)</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Register a unique .sel domain name that resolves to your Selendra address, making your account easier to find and remember.
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 mr-4">
              3
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Get Verified (Optional)</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Submit your identity for verification by registrars. Verified identities receive a trust badge visible throughout the ecosystem.
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 mr-4">
              4
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Enhanced Experience</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your identity is displayed across all Selendra applications, including the Explorer, making interactions more human-readable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Identities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Recently Registered Identities</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Account
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Domain
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Verified
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registered Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Sample data - replace with actual data */}
              {[
                { address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', name: 'Alice Wonderland', domain: 'alice.sel', verified: true, date: '2023-09-15' },
                { address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', name: 'Bob Builder', domain: 'bob.sel', verified: true, date: '2023-09-14' },
                { address: '5H7r4EpkXvz4HzdK5EUPBRrPqpHUWzESQJN1xwMSXJWrvExV', name: 'Charlie Chan', domain: 'charlie.sel', verified: false, date: '2023-09-12' },
                { address: '5DAArrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', name: 'Dave Davids', domain: null, verified: false, date: '2023-09-10' },
                { address: '5H7r4UpkXvz4HzdK5EUPBRrPqpHUWzESQJN1xwMSXJWrvExV', name: 'Eve Edwards', domain: 'eve.sel', verified: true, date: '2023-09-09' },
              ].map((identity, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/accounts/${identity.address}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline font-mono text-sm"
                    >
                      {`${identity.address.slice(0, 6)}...${identity.address.slice(-4)}`}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">{identity.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {identity.domain ? (
                      <span className="text-primary-600 dark:text-primary-400 font-medium">{identity.domain}</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {identity.verified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckBadgeIcon className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Unverified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {identity.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Identity; 
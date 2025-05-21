import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowsRightLeftIcon, 
  ArrowTopRightOnSquareIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import IdentityBadge from '../components/identity/IdentityBadge';

const ExtrinsicDetails: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'parameters'>('overview');
  const [copied, setCopied] = useState(false);

  // Mock data - would be replaced with API call based on hash
  const extrinsic = {
    extrinsic_hash: hash || '0x1234567890',
    block_number: 12345678,
    timestamp: new Date().toISOString(),
    sender: '5GTG4ovJmQtGKwdYiwr54C5HJRWtJNMQS6H9FKnmhJvzHBXC',
    action: 'staking.bond',
    nonce: 123,
    result: true,
    parameters: JSON.stringify({
      controller: '5GTG4ovJmQtGKwdYiwr54C5HJRWtJNMQS6H9FKnmhJvzHBXC',
      value: '1000000000000000000',
      payee: 'Staked'
    }, null, 2),
    signature: '0x' + Array(128).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
    fee: '0.00123',
    events: [
      {
        id: '1',
        transaction_hash: hash || '0x1234567890',
        event_index: 0,
        section: 'system',
        method: 'ExtrinsicSuccess',
        phase: 'ApplyExtrinsic',
        data: { weight: '100000', class: 'Normal', paysFee: 'Yes' }
      },
      {
        id: '2',
        transaction_hash: hash || '0x1234567890',
        event_index: 1,
        section: 'staking',
        method: 'Bonded',
        phase: 'ApplyExtrinsic',
        data: { stash: '5GTG4ovJmQtGKwdYiwr54C5HJRWtJNMQS6H9FKnmhJvzHBXC', amount: '1000000000000000000' }
      },
      {
        id: '3',
        transaction_hash: hash || '0x1234567890',
        event_index: 2,
        section: 'treasury',
        method: 'Deposit',
        phase: 'ApplyExtrinsic',
        data: { value: '0.00012' }
      }
    ]
  };

  // Mock identity
  const identity = {
    id: '1',
    name: 'Alice',
    sel_domain: 'alice.sel',
    web: 'alice.com',
    email: 'alice@example.com'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link to="/extrinsics" className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Extrinsics
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center mb-3 sm:mb-0">
              <ArrowsRightLeftIcon className="h-6 w-6 text-primary-500 dark:text-primary-400 mr-3" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Extrinsic Details
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {extrinsic.result ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Success
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Failed
                </span>
              )}
              
              <a 
                href={`https://selendra.subscan.io/extrinsic/${extrinsic.extrinsic_hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                View in Subscan
              </a>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mr-2">Extrinsic Hash:</p>
            <div className="flex items-center">
              <span className="font-mono text-sm text-gray-900 dark:text-white">{extrinsic.extrinsic_hash}</span>
              <button 
                onClick={() => copyToClipboard(extrinsic.extrinsic_hash)}
                className="ml-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                {copied ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  <DocumentDuplicateIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <InformationCircleIcon className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'events'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BeakerIcon className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Events ({extrinsic.events.length})
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'parameters'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <DocumentDuplicateIcon className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Parameters
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Block</p>
                <Link 
                  to={`/blocks/${extrinsic.block_number}`}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  #{extrinsic.block_number.toLocaleString()}
                </Link>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Timestamp</p>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                  <span className="text-gray-900 dark:text-white">
                    {new Date(extrinsic.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Action</p>
                <span className="text-gray-900 dark:text-white">
                  {extrinsic.action}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sender</p>
                <IdentityBadge 
                  address={extrinsic.sender} 
                  identity={identity}
                  truncate={false}
                  showFullInfo
                />
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nonce</p>
                <span className="text-gray-900 dark:text-white">
                  {extrinsic.nonce}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fee</p>
                <span className="text-gray-900 dark:text-white">
                  {extrinsic.fee} SEL
                </span>
              </div>
              
              <div className="md:col-span-2 mt-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Signature</p>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-300 font-mono">
                    {extrinsic.signature}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'events' && (
            <div>
              {extrinsic.events.map((event, index) => (
                <div 
                  key={event.id}
                  className={`
                    p-4 rounded-md
                    ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-800'} 
                    ${index !== extrinsic.events.length - 1 ? 'mb-4' : ''}
                  `}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs font-medium mr-3">
                        {event.event_index}
                      </span>
                      <span className="text-base font-medium text-gray-900 dark:text-white">
                        {event.section}.{event.method}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Phase: {event.phase}
                    </span>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900/20 rounded border border-gray-200 dark:border-gray-700 p-3 overflow-auto">
                    <pre className="text-xs text-gray-800 dark:text-gray-300 font-mono">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'parameters' && (
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-md p-4 overflow-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-300 font-mono">
                {extrinsic.parameters}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtrinsicDetails; 
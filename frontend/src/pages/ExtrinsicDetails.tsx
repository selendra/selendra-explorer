import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowsRightLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import IdentityBadge from '../components/identity/IdentityBadge';
import { useSubstrateExtrinsicsByBlock } from '../contexts/ApiContext';
import { formatDistance } from 'date-fns';

const ExtrinsicDetails: React.FC = () => {
  const { blockNumber, extrinsicIndex } = useParams<{ blockNumber: string; extrinsicIndex: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'parameters'>('overview');
  const [copied, setCopied] = useState<string>('');
  
  const blockNum = blockNumber ? parseInt(blockNumber, 10) : 0;
  const extIndex = extrinsicIndex ? parseInt(extrinsicIndex, 10) : 0;
  
  const { data: extrinsics, isLoading, error } = useSubstrateExtrinsicsByBlock(blockNum);
  const extrinsic = extrinsics?.find(ext => ext.extrinsic_index === extIndex);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error || !extrinsic) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Extrinsic not found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The extrinsic you're looking for doesn't exist or couldn't be loaded.
          </p>
          <div className="mt-6">
            <Link to="/extrinsics" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Extrinsics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const extrinsicId = `${blockNum}-${extIndex}`;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Success
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mr-2">Extrinsic ID:</p>
            <div className="flex items-center">
              <span className="font-mono text-sm text-gray-900 dark:text-white">{extrinsicId}</span>
              <button onClick={() => copyToClipboard(extrinsicId, 'id')} className="ml-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                {copied === 'id' ? <CheckCircleIcon className="h-4 w-4" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${activeTab === 'overview' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
            >
              <InformationCircleIcon className="h-4 w-4 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`${activeTab === 'parameters' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
            >
              <BeakerIcon className="h-4 w-4 mr-2" />
              Parameters
            </button>
          </nav>
        </div>

        <div className="px-6 py-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Block Number</dt>
                      <dd className="mt-1">
                        <Link to={`/blocks/${extrinsic.block_number}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                          {extrinsic.block_number.toLocaleString()}
                        </Link>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Extrinsic Index</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{extrinsic.extrinsic_index}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Call</dt>
                      <dd className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {extrinsic.call_module}.{extrinsic.call_function}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDistance(new Date(extrinsic.timestamp), new Date(), { addSuffix: true })}
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({new Date(extrinsic.timestamp).toLocaleString()})
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Execution Details</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Signed</dt>
                      <dd className="mt-1">
                        {extrinsic.is_signed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            No
                          </span>
                        )}
                      </dd>
                    </div>
                    {extrinsic.signer && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Signer</dt>
                        <dd className="mt-1">
                          <IdentityBadge address={extrinsic.signer} />
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parameters' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Call Parameters</h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Arguments</span>
                  <button onClick={() => copyToClipboard(extrinsic.args, 'args')} className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 flex items-center">
                    {copied === 'args' ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(JSON.parse(extrinsic.args), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtrinsicDetails;
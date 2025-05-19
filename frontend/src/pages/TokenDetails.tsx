import React from 'react';
import { useParams } from 'react-router-dom';

const TokenDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Token Details</h1>
      <div className="card p-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Token details for address:
        </p>
        <p className="font-mono break-all">{address}</p>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Token details page is under construction.
        </p>
      </div>
    </div>
  );
};

export default TokenDetails;

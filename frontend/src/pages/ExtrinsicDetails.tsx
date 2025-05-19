import React from 'react';
import { useParams } from 'react-router-dom';

const ExtrinsicDetails: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Extrinsic Details</h1>
      <div className="card p-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Extrinsic details for hash:
        </p>
        <p className="font-mono break-all">{hash}</p>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Extrinsic details page is under construction.
        </p>
      </div>
    </div>
  );
};

export default ExtrinsicDetails;

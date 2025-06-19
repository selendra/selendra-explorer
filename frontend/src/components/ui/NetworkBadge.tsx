import React from 'react';
import { NetworkType } from '../../types';

interface NetworkBadgeProps {
  type: NetworkType;
  className?: string;
}

const NetworkBadge: React.FC<NetworkBadgeProps> = ({ type, className = '' }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const typeClasses = {
    evm: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    wasm: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
    substrate: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
  };
  
  return (
    <span className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      {type === 'evm' ? 'EVM' : type === 'wasm' ? 'Wasm' : 'Substrate'}
    </span>
  );
};

export default NetworkBadge;

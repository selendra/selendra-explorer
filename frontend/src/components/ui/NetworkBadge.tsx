import React from 'react';

interface NetworkBadgeProps {
  type: 'evm' | 'substrate';
  className?: string;
}

const NetworkBadge: React.FC<NetworkBadgeProps> = ({ type, className = "" }) => {
  const badgeStyles = type === 'evm' 
    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeStyles} ${className}`}>
      {type.toUpperCase()}
    </span>
  );
};

export default NetworkBadge;
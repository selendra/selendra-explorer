import React from 'react';
import { TransactionStatus } from '../../types';

interface StatusBadgeProps {
  status: TransactionStatus | 'active' | 'waiting' | 'inactive';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const statusClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    failed: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    active: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  
  const statusText = {
    success: 'Success',
    failed: 'Failed',
    pending: 'Pending',
    active: 'Active',
    waiting: 'Waiting',
    inactive: 'Inactive',
  };
  
  return (
    <span className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {statusText[status]}
    </span>
  );
};

export default StatusBadge;

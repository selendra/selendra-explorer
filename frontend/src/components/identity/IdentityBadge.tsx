import React from 'react';
import { Link } from 'react-router-dom';
import { Identity } from '../../types/account';
import { IdentificationIcon } from '@heroicons/react/24/outline';

interface IdentityBadgeProps {
  address: string;
  identity?: Identity;
  truncate?: boolean;
  showFullInfo?: boolean;
  className?: string;
}

const IdentityBadge: React.FC<IdentityBadgeProps> = ({
  address,
  identity,
  truncate = true,
  showFullInfo = false,
  className = '',
}) => {
  // Function to truncate address
  const truncateAddress = (addr: string) => {
    if (!truncate) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!identity) {
    return (
      <Link 
        to={`/accounts/${address}`}
        className={`inline-flex items-center font-mono text-sm ${className}`}
      >
        {truncateAddress(address)}
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center group relative ${className}`}>
      <Link 
        to={`/accounts/${address}`}
        className="inline-flex items-center space-x-1.5"
      >
        <img 
          src="/logo-monochrome.png" 
          alt="Profile" 
          className="h-4 w-4 text-primary-500 dark:text-primary-400" 
        />
        
        {identity.sel_domain ? (
          <span className="font-medium text-sm text-primary-600 dark:text-primary-400">
            {identity.sel_domain}
          </span>
        ) : identity.name ? (
          <span className="font-medium text-sm">
            {identity.name}
          </span>
        ) : (
          <span className="font-mono text-sm">
            {truncateAddress(address)}
          </span>
        )}
      </Link>
      
      {showFullInfo && identity && (
        <div className="absolute z-10 invisible group-hover:visible top-full left-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="p-3 space-y-2">
            <div className="flex items-start space-x-2">
              <IdentificationIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {identity.name || 'Unnamed'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                  {address}
                </p>
              </div>
            </div>
            
            {identity.sel_domain && (
              <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">Domain: </span>
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                  {identity.sel_domain}
                </span>
              </div>
            )}
            
            {(identity.web || identity.email || identity.social_media) && (
              <div className="pt-1 border-t border-gray-100 dark:border-gray-700 text-xs">
                {identity.web && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Web:</span>
                    <a href={identity.web.startsWith('http') ? identity.web : `https://${identity.web}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-primary-600 dark:text-primary-400 hover:underline truncate max-w-[180px]">
                      {identity.web}
                    </a>
                  </div>
                )}
                
                {identity.email && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <a href={`mailto:${identity.email}`}
                       className="text-primary-600 dark:text-primary-400 hover:underline truncate max-w-[180px]">
                      {identity.email}
                    </a>
                  </div>
                )}
                
                {identity.social_media && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Social:</span>
                    <span className="truncate max-w-[180px]">{identity.social_media}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentityBadge; 
import React from 'react';
import { Link } from 'react-router-dom';
import { truncateAddress } from '../../utils';

interface AddressDisplayProps {
  address: string;
  networkType: 'evm' | 'substrate';
  truncate?: boolean;
  className?: string;
  linkTo?: string;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  networkType,
  truncate = true,
  className = "",
  linkTo
}) => {
  const displayAddress = truncate ? truncateAddress(address) : address;
  const defaultPath = networkType === 'evm' ? `/evm/accounts/${address}` : `/substrate/accounts/${address}`;
  const path = linkTo || defaultPath;

  return (
    <Link
      to={path}
      className={`font-mono hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${className}`}
      title={address}
    >
      {displayAddress}
    </Link>
  );
};

export default AddressDisplay;
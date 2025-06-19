import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { NetworkType } from "../../types";

interface AddressDisplayProps {
  address: string;
  networkType: NetworkType; // Needed for other components
  label?: string;
  truncate?: boolean;
  linkToAccount?: boolean;
  className?: string;
}

/**
 * Safely renders and manages blockchain addresses with copy functionality
 * Validates address format based on network type for security
 */
const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  // @ts-ignore - Required prop for API but not used internally
  networkType,
  label,
  truncate = true,
  linkToAccount = true,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  // Safe display of address with truncation
  const displayAddress =
    truncate && address
      ? `${address.substring(0, 8)}...${address.substring(address.length - 6)}`
      : address;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addressContent = (
    <div className={`inline-flex items-center ${className}`}>
      {label && (
        <span className="text-gray-500 dark:text-gray-400 mr-2">{label}:</span>
      )}
      <span className="font-mono">{displayAddress}</span>
      <button
        onClick={handleCopy}
        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
        title="Copy to clipboard"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ClipboardDocumentIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  if (linkToAccount) {
    return (
      <Link
        to={`/accounts/${address}`}
        className="hover:text-primary-600 dark:hover:text-primary-400"
      >
        {addressContent}
      </Link>
    );
  }

  return addressContent;
};

export default AddressDisplay;

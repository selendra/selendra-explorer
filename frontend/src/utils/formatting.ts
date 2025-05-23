/**
 * Utility functions for formatting blockchain data
 */

/**
 * Truncates an address or hash for display purposes
 * @param address The full address string
 * @param startLength Number of characters to keep at the start
 * @param endLength Number of characters to keep at the end
 * @returns Truncated address with ellipsis
 */
export const truncateAddress = (
  address: string,
  startLength = 6,
  endLength = 4
): string => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  const start = address.substring(0, startLength);
  const end = address.substring(address.length - endLength);
  
  return `${start}...${end}`;
};

/**
 * Formats a number as currency
 * @param value Number to format
 * @param currency Currency code
 * @param locale Locale for formatting
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Formats a number with specified decimal places
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number | string,
  decimals = 2
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formats a token balance based on token decimals
 * @param balance Raw balance value
 * @param decimals Token decimals (default: 18 for most tokens)
 * @returns Formatted balance string
 */
export const formatTokenBalance = (
  balance: string | number,
  decimals = 18
): string => {
  const value = typeof balance === 'string' ? balance : balance.toString();
  const padded = value.padStart(decimals, '0');
  
  const integerPart = padded.slice(0, -decimals) || '0';
  const fractionalPart = padded.slice(-decimals);
  
  // Remove trailing zeros
  const trimmedFractional = fractionalPart.replace(/0+$/, '');
  
  if (trimmedFractional.length === 0) {
    return integerPart;
  }
  
  return `${integerPart}.${trimmedFractional}`;
}; 
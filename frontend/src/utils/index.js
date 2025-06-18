export const formatDate = (timestamp, isSeconds = false) => {
  const date = new Date(isSeconds ? timestamp * 1000 : timestamp);
  return date.toLocaleDateString();
};

export const formatDateTime = (timestamp, isSeconds = false) => {
  const date = new Date(isSeconds ? timestamp * 1000 : timestamp);
  return date.toLocaleString();
};

export const formatRelativeTime = (timestamp, isSeconds = false) => {
  const date = new Date(isSeconds ? timestamp * 1000 : timestamp);
  const now = new Date();
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
};

// String utilities
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateHash = (hash, length = 10) => {
  if (!hash) return '';
  if (hash.length <= length + 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-4)}`;
};

export const truncateAddress = (address, length = 8) => {
  if (!address) return '';
  if (address.length <= length + 2) return address;
  return `${address.slice(0, length)}...${address.slice(-4)}`;
};

// Blockchain utilities
export const formatWei = (wei, decimals = 18, displayDecimals = 6) => {
  if (!wei) return '0';
  const value = Number(wei) / Math.pow(10, decimals);
  return value.toFixed(displayDecimals);
};

export const formatTokenAmount = (amount, decimals = 18, symbol = '') => {
  const formatted = formatWei(amount, decimals);
  return symbol ? `${formatted} ${symbol}` : formatted;
};

export const formatGasPrice = (gasPrice) => {
  const gwei = Number(gasPrice) / 1e9;
  return `${gwei.toFixed(2)} Gwei`;
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validation utilities
export const isValidEvmAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidSs58Address = (address) => {
  return /^5[a-zA-Z0-9]{47}$/.test(address);
};

export const isValidHash = (hash) => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

export const isValidBlockNumber = (blockNumber) => {
  return /^\d+$/.test(blockNumber.toString()) && Number(blockNumber) >= 0;
};

// HTTP utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// API utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
};

export const handleApiError = (error) => {
  if (error.name === 'AbortError') {
    return 'Request was cancelled';
  }
  if (error.name === 'TimeoutError') {
    return 'Request timeout - please try again';
  }
  if (error.response) {
    return error.response.data?.error || 'Server error occurred';
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Array utilities
export const paginate = (array, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return array.slice(startIndex, endIndex);
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

// Number utilities
export const formatNumber = (num, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value, total) => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(2)}%`;
};

// Local storage utilities
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Copy to clipboard utility
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy to clipboard:', fallbackError);
      return false;
    }
  }
};

// Theme utilities
export const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// URL utilities
export const getSearchParams = () => {
  return new URLSearchParams(window.location.search);
};

export const updateSearchParams = (params) => {
  const searchParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value.toString());
    }
  });
  
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.replaceState({}, '', newUrl);
};
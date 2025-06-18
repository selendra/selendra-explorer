export { useApi } from './useApi';
export * from './useNetworkData';
export * from './useEvmData';
export * from './useSubstrateData';
export { useAddressConversion } from './useAddressConversion';
export { useWebSocket } from './useWebSocket';
export { usePagination } from './usePagination';
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
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
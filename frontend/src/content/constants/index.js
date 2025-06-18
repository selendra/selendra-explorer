export const SITE_CONSTANTS = {
  SITE_NAME: 'Blockchain Explorer',
  SITE_DESCRIPTION: 'Explore EVM and Substrate blockchain data in real-time',
  
  // Navigation
  NAV_ITEMS: [
    { label: 'Dashboard', path: '/dashboard' },
    { 
      label: 'EVM', 
      path: '/evm/blocks',
      children: [
        { label: 'Blocks', path: '/evm/blocks' },
        { label: 'Transactions', path: '/evm/transactions' },
        { label: 'Accounts', path: '/evm/accounts' },
        { label: 'Contracts', path: '/evm/contracts' }
      ]
    },
    { 
      label: 'Substrate', 
      path: '/substrate/blocks',
      children: [
        { label: 'Blocks', path: '/substrate/blocks' },
        { label: 'Extrinsics', path: '/substrate/extrinsics' },
        { label: 'Events', path: '/substrate/events' }
      ]
    },
    { label: 'Tools', path: '/address-converter' },
    { label: 'API', path: '/api-docs' }
  ],
  
  // Blockchain constants
  BLOCKCHAIN: {
    TRANSACTION_STATUSES: {
      SUCCESS: 'Success',
      FAILED: 'Failed',
      PENDING: 'Pending'
    },
    
    TRANSACTION_TYPES: {
      LEGACY: 'Legacy',
      ACCESS_LIST: 'AccessList',
      DYNAMIC_FEE: 'DynamicFee'
    },
    
    ADDRESS_TYPES: {
      SS58: 'SS58',
      H160: 'H160'
    },
    
    CONTRACT_TYPES: {
      ERC20: 'ERC20',
      ERC721: 'ERC721',
      ERC1155: 'ERC1155',
      DEX: 'DEX',
      LENDING_PROTOCOL: 'LendingProtocol',
      PROXY: 'Proxy',
      ORACLE: 'Oracle',
      UNKNOWN: 'Unknown'
    }
  },
  
  // Messages
  MESSAGES: {
    LOADING: 'Loading blockchain data...',
    ERROR: 'Failed to fetch data',
    NO_DATA: 'No data available',
    SUCCESS: 'Operation completed successfully',
    NETWORK_ERROR: 'Network connection error',
    TIMEOUT_ERROR: 'Request timeout - please try again',
    INVALID_ADDRESS: 'Invalid address format',
    INVALID_HASH: 'Invalid hash format',
    BLOCK_NOT_FOUND: 'Block not found',
    TRANSACTION_NOT_FOUND: 'Transaction not found',
    CONTRACT_NOT_VERIFIED: 'Contract not verified'
  },
  
  // Status codes
  STATUS: {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
    REFETCHING: 'refetching'
  },
  
  // Data formatting
  FORMAT: {
    CURRENCY_DECIMALS: 6,
    HASH_DISPLAY_LENGTH: 10,
    ADDRESS_DISPLAY_LENGTH: 8,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  }
};
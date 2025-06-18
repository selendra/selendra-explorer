interface TextContent {
  home: {
    title: string;
    subtitle: string;
    description: string;
    features: string[];
  };
  dashboard: {
    title: string;
    subtitle: string;
    evmSection: string;
    substrateSection: string;
  };
  evm: {
    blocks: {
      title: string;
      subtitle: string;
      latest: string;
      search: string;
    };
    transactions: {
      title: string;
      subtitle: string;
      latest: string;
      search: string;
    };
    accounts: {
      title: string;
      subtitle: string;
      search: string;
    };
    contracts: {
      title: string;
      subtitle: string;
      verified: string;
      types: string;
    };
  };
  substrate: {
    blocks: {
      title: string;
      subtitle: string;
      latest: string;
      finalized: string;
    };
    extrinsics: {
      title: string;
      subtitle: string;
      latest: string;
      modules: string;
    };
    events: {
      title: string;
      subtitle: string;
      recent: string;
      modules: string;
    };
  };
  tools: {
    addressConverter: {
      title: string;
      subtitle: string;
      ss58ToEvm: string;
      evmToSs58: string;
      description: string;
    };
    search: {
      title: string;
      subtitle: string;
      placeholder: string;
      results: string;
    };
  };
  api: {
    title: string;
    subtitle: string;
    description: string;
    baseUrl: string;
    endpoints: string;
    examples: string;
  };
  about: {
    title: string;
    description: string;
    features: string;
    technology: string;
  };
  errors: {
    notFound: string;
    networkError: string;
    timeout: string;
    invalidInput: string;
    serverError: string;
  };
  labels: {
    // Common labels
    address: string;
    hash: string;
    blockNumber: string;
    timestamp: string;
    amount: string;
    fee: string;
    gas: string;
    nonce: string;
    status: string;
    type: string;
    
    // EVM specific
    gasPrice: string;
    gasLimit: string;
    gasUsed: string;
    baseFee: string;
    burnFee: string;
    validator: string;
    transactionCount: string;
    
    // Substrate specific
    module: string;
    function: string;
    event: string;
    extrinsic: string;
    era: string;
    session: string;
    phase: string;
    signer: string;
    
    // Contract specific
    contractType: string;
    verified: string;
    symbol: string;
    decimals: string;
    totalSupply: string;
    creator: string;
  };
  buttons: {
    search: string;
    convert: string;
    refresh: string;
    loadMore: string;
    back: string;
    details: string;
    copy: string;
    download: string;
    filter: string;
    reset: string;
  };
  placeholders: {
    searchAddress: string;
    searchHash: string;
    searchBlock: string;
    ss58Address: string;
    evmAddress: string;
    contractAddress: string;
  };
}

export const TEXTS: TextContent = {
  home: {
    title: 'Blockchain Explorer',
    subtitle: 'Real-time EVM and Substrate blockchain data',
    description: 'Explore blocks, transactions, accounts, contracts, extrinsics, and events across multiple blockchain networks.',
    features: [
      'Real-time blockchain data monitoring',
      'Cross-chain address conversion',
      'Smart contract verification',
      'Advanced search and filtering'
    ]
  },
  
  dashboard: {
    title: 'Network Dashboard',
    subtitle: 'Live blockchain statistics and metrics',
    evmSection: 'EVM Network',
    substrateSection: 'Substrate Network'
  },
  
  evm: {
    blocks: {
      title: 'EVM Blocks',
      subtitle: 'Browse Ethereum Virtual Machine blocks',
      latest: 'Latest Block',
      search: 'Search by block number or hash'
    },
    transactions: {
      title: 'EVM Transactions',
      subtitle: 'View EVM transaction history',
      latest: 'Recent Transactions',
      search: 'Search by transaction hash'
    },
    accounts: {
      title: 'EVM Accounts',
      subtitle: 'Explore EVM account information',
      search: 'Search by address'
    },
    contracts: {
      title: 'Smart Contracts',
      subtitle: 'Browse verified smart contracts',
      verified: 'Verified Contracts',
      types: 'Contract Types'
    }
  },
  
  substrate: {
    blocks: {
      title: 'Substrate Blocks',
      subtitle: 'Browse Substrate blockchain blocks',
      latest: 'Latest Block',
      finalized: 'Finalized Blocks'
    },
    extrinsics: {
      title: 'Extrinsics',
      subtitle: 'View Substrate extrinsics (transactions)',
      latest: 'Recent Extrinsics',
      modules: 'By Module'
    },
    events: {
      title: 'Events',
      subtitle: 'Browse blockchain events',
      recent: 'Recent Events',
      modules: 'By Module'
    }
  },
  
  tools: {
    addressConverter: {
      title: 'Address Converter',
      subtitle: 'Convert between SS58 and EVM address formats',
      ss58ToEvm: 'SS58 to EVM',
      evmToSs58: 'EVM to SS58',
      description: 'Convert addresses between Substrate SS58 format and Ethereum H160 format'
    },
    search: {
      title: 'Search',
      subtitle: 'Find blocks, transactions, accounts, and more',
      placeholder: 'Enter address, hash, or block number',
      results: 'Search Results'
    }
  },
  
  api: {
    title: 'API Documentation',
    subtitle: 'Blockchain REST API reference',
    description: 'Complete documentation for accessing blockchain data programmatically',
    baseUrl: 'Base URL',
    endpoints: 'Available Endpoints',
    examples: 'Code Examples'
  },
  
  about: {
    title: 'About Blockchain Explorer',
    description: 'A comprehensive blockchain data explorer supporting both EVM and Substrate networks.',
    features: 'Key Features',
    technology: 'Technology Stack'
  },
  
  errors: {
    notFound: 'Resource not found',
    networkError: 'Network connection failed',
    timeout: 'Request timeout',
    invalidInput: 'Invalid input format',
    serverError: 'Server error occurred'
  },
  
  labels: {
    // Common labels
    address: 'Address',
    hash: 'Hash',
    blockNumber: 'Block Number',
    timestamp: 'Timestamp',
    amount: 'Amount',
    fee: 'Fee',
    gas: 'Gas',
    nonce: 'Nonce',
    status: 'Status',
    type: 'Type',
    
    // EVM specific
    gasPrice: 'Gas Price',
    gasLimit: 'Gas Limit',
    gasUsed: 'Gas Used',
    baseFee: 'Base Fee',
    burnFee: 'Burn Fee',
    validator: 'Validator',
    transactionCount: 'Transaction Count',
    
    // Substrate specific
    module: 'Module',
    function: 'Function',
    event: 'Event',
    extrinsic: 'Extrinsic',
    era: 'Era',
    session: 'Session',
    phase: 'Phase',
    signer: 'Signer',
    
    // Contract specific
    contractType: 'Contract Type',
    verified: 'Verified',
    symbol: 'Symbol',
    decimals: 'Decimals',
    totalSupply: 'Total Supply',
    creator: 'Creator'
  },
  
  buttons: {
    search: 'Search',
    convert: 'Convert',
    refresh: 'Refresh',
    loadMore: 'Load More',
    back: 'Back',
    details: 'View Details',
    copy: 'Copy',
    download: 'Download',
    filter: 'Filter',
    reset: 'Reset'
  },
  
  placeholders: {
    searchAddress: 'Enter address (0x... or 5...)',
    searchHash: 'Enter transaction or block hash',
    searchBlock: 'Enter block number',
    ss58Address: 'Enter SS58 address (5...)',
    evmAddress: 'Enter EVM address (0x...)',
    contractAddress: 'Enter contract address'
  }
};
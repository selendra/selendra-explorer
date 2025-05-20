import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearch } from '../contexts/ApiContext';
import NetworkBadge from '../components/ui/NetworkBadge';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data: searchResults, isLoading, error } = useSearch(query);
  
  if (query.length < 3) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Search</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Please enter at least 3 characters to search.
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Error</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          An error occurred while searching. Please try again.
        </p>
      </div>
    );
  }
  
  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">No Results Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          No results found for "{query}". Try a different search term.
        </p>
      </div>
    );
  }
  
  // Group results by type
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof searchResults>);
  
  // Type labels and routes
  const typeInfo = {
    block: { label: 'Blocks', route: '/blocks' },
    transaction: { label: 'Transactions', route: '/transactions' },
    account: { label: 'Accounts', route: '/accounts' },
    contract: { label: 'Contracts', route: '/contracts' },
    token: { label: 'Tokens', route: '/tokens' },
    validator: { label: 'Validators', route: '/validators' },
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Results</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Found {searchResults.length} results for "{query}"
        </p>
      </div>
      
      <div className="space-y-8">
        {Object.entries(groupedResults).map(([type, results]) => (
          <div key={type} className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {typeInfo[type as keyof typeof typeInfo]?.label || type}
              </h2>
              <Link to={typeInfo[type as keyof typeof typeInfo]?.route || '/'} className="text-primary-600 dark:text-primary-400 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {results.map((result) => {
                // Determine the link based on the result type
                let link = '/';
                if (type === 'block') {
                  link = `/blocks/${result.id.replace('block-', '')}`;
                } else if (type === 'transaction') {
                  link = `/transactions/${result.id.replace('tx-', '')}`;
                } else if (type === 'account') {
                  link = `/accounts/${result.id.replace('account-', '')}`;
                } else if (type === 'contract') {
                  link = `/contracts/${result.id.replace('contract-', '')}`;
                } else if (type === 'token') {
                  link = `/tokens/${result.id.replace('token-', '')}`;
                } else if (type === 'validator') {
                  link = `/validators/${result.id.replace('validator-', '')}`;
                }
                
                return (
                  <div key={result.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Link to={link} className="block">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-primary-600 dark:text-primary-400">
                            {result.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {result.subtitle}
                          </div>
                        </div>
                        <NetworkBadge type={result.networkType} />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;

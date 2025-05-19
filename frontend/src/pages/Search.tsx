import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const api = useApi();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await api.search(query);
      
      // Redirect based on the type of result
      if (result.type === 'block') {
        navigate(`/blocks/${result.result.number}`);
      } else if (result.type === 'transaction') {
        navigate(`/transactions/${result.result.hash}`);
      } else if (result.type === 'account' || result.type === 'contract') {
        navigate(`/accounts/${result.result.address}`);
      } else if (result.type === 'token') {
        navigate(`/tokens/${result.result.address}`);
      } else if (result.type === 'extrinsic') {
        navigate(`/extrinsics/${result.result.hash}`);
      } else {
        setError('No results found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      <div className="card mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search by Block Number, Transaction Hash, Address, or Token
            </label>
            <div className="flex">
              <input
                type="text"
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Block number, transaction hash, address, or token name"
                className="input flex-grow"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary ml-2"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        </form>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Search Tips</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Block:</strong> Search by block number (e.g., "12345") or block hash
          </li>
          <li>
            <strong>Transaction:</strong> Search by transaction hash
          </li>
          <li>
            <strong>Address:</strong> Search by account or contract address
          </li>
          <li>
            <strong>Token:</strong> Search by token name, symbol, or address
          </li>
          <li>
            <strong>Extrinsic:</strong> Search by extrinsic hash
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Search;

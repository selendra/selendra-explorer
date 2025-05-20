import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearch } from "../../contexts/ApiContext";

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = "" }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: searchResults, isLoading } = useSearch(query);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when pressing '/' key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  const handleResultClick = (type: string, id: string) => {
    setIsOpen(false);
    setIsFocused(false);
    setQuery("");

    switch (type) {
      case "block":
        navigate(`/blocks/${id.replace("block-", "")}`);
        break;
      case "transaction":
        navigate(`/transactions/${id.replace("tx-", "")}`);
        break;
      case "account":
        navigate(`/accounts/${id.replace("account-", "")}`);
        break;
      case "contract":
        navigate(`/contracts/${id.replace("contract-", "")}`);
        break;
      case "token":
        navigate(`/tokens/${id.replace("token-", "")}`);
        break;
      case "validator":
        navigate(`/validators/${id.replace("validator-", "")}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <form onSubmit={handleSearch}>
        <div
          className={`relative transition-all duration-300 ${
            isFocused ? "ring-2 ring-primary-500/50 dark:ring-secondary-400/60" : ""
          }`}
        >
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon
              className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
                isFocused
                  ? "text-primary-500 dark:text-secondary-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              aria-hidden="true"
            />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 border border-gray-200/70 dark:border-gray-700/70 rounded-full leading-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary-300/70 dark:focus:border-secondary-600/50 text-sm md:text-base transition-all duration-200 shadow-md hover:shadow-lg"
            placeholder="Search by Block / TX / Account / Contract..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length > 2) {
                setIsOpen(true);
              } else {
                setIsOpen(false);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              if (query.length > 2) {
                setIsOpen(true);
              }
            }}
            onBlur={() => {
              if (!isOpen) {
                setIsFocused(false);
              }
            }}
          />
          <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
            <span className="flex items-center justify-center h-5 w-5 text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 opacity-70">
              /
            </span>
          </div>
        </div>
      </form>

      {isOpen && query.length > 2 && (
        <div className="absolute z-10 mt-2 w-full bg-white/95 dark:bg-gray-800/95 shadow-xl rounded-lg py-1 text-sm ring-1 ring-black/5 dark:ring-white/10 overflow-auto max-h-96 backdrop-blur-sm">
          {isLoading ? (
            <div className="px-4 py-4 text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-500 dark:text-secondary-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Searching...
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  className="w-full text-left px-4 py-2.5 sm:py-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
                  onClick={() => handleResultClick(result.type, result.id)}
                >
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                        result.networkType === "evm"
                          ? "bg-primary-400"
                          : "bg-secondary-400"
                      }`}
                    ></span>
                    {result.type.charAt(0).toUpperCase() + result.type.slice(1)}{" "}
                    • {result.subtitle}
                  </div>
                </button>
              ))}
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  className="w-full text-left text-primary-600 dark:text-secondary-400 hover:text-primary-700 dark:hover:text-secondary-300 text-sm font-medium transition-colors duration-150"
                  onClick={handleSearch}
                >
                  View all results for "{query}"
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

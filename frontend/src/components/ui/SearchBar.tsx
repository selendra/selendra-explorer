import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSearch } from "../../contexts/ApiContext";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showHotkey?: boolean;
  autoFocus?: boolean;
}

/**
 * SearchBar component that provides search functionality for the application.
 * Features:
 * - Input validation and sanitization
 * - Debounced search to reduce API calls
 * - Keyboard navigation with '/' shortcut
 * - Dropdown with search results
 * - Improved accessibility
 */
const SearchBar: React.FC<SearchBarProps> = ({ 
  className = "",
  placeholder = "Search by Block / TX / Account / Contract...",
  showHotkey = true,
  autoFocus = false
}) => {
  const [query, setQuery] = useState("");
  const [sanitizedQuery, setSanitizedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { data: searchResults, isLoading } = useSearch(sanitizedQuery);

  // Sanitize input to prevent XSS
  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/[<>]/g, "") // Remove < and > characters to prevent HTML injection
      .replace(/[&]/g, "&amp;") // Escape ampersands
      .replace(/["']/g, "") // Remove quotes
      .replace(/[\\]/g, "") // Remove backslashes
      .trim()
      .substring(0, 100); // Limit length to 100 characters
  }, []);

  // Update sanitized query with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      const sanitized = sanitizeInput(query);
      if (sanitized !== sanitizedQuery) {
        setSanitizedQuery(sanitized);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, sanitizeInput, sanitizedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
        setSelectedResultIndex(-1);
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
      if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    if (showHotkey) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showHotkey]);

  // Auto focus when autoFocus prop is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Show search results when query is long enough
  useEffect(() => {
    if (sanitizedQuery.length > 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSelectedResultIndex(-1);
    }
  }, [sanitizedQuery]);

  // Handle keyboard navigation in search results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    // Handle arrow keys for navigation
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchResults && searchResults.length > 0) {
        setSelectedResultIndex((prevIndex) => 
          prevIndex < searchResults.length - 1 ? prevIndex + 1 : prevIndex
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedResultIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1));
    } else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault();
      if (searchResults && searchResults.length > 0) {
        const selected = searchResults[selectedResultIndex];
        handleResultClick(selected.type, selected.id);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSelectedResultIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (sanitizedQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
      setIsOpen(false);
      setSelectedResultIndex(-1);
      setIsFocused(false);
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedResultIndex(-1);
    inputRef.current?.focus();
  };

  // Validate and sanitize the ID before navigation
  const validateId = (id: string, type: string): string => {
    // Ensure ID only contains alphanumeric characters, hyphens, and underscores
    const sanitizedId = id.replace(/[^a-zA-Z0-9-_]/g, "");

    // Remove type prefix for security
    switch (type) {
      case "block":
        return sanitizedId.replace(/^block-/, "");
      case "transaction":
        return sanitizedId.replace(/^tx-/, "");
      case "account":
        return sanitizedId.replace(/^account-/, "");
      case "contract":
        return sanitizedId.replace(/^contract-/, "");
      case "token":
        return sanitizedId.replace(/^token-/, "");
      case "validator":
        return sanitizedId.replace(/^validator-/, "");
      default:
        return sanitizedId;
    }
  };

  const handleResultClick = (type: string, id: string) => {
    setIsOpen(false);
    setIsFocused(false);
    setSelectedResultIndex(-1);
    setQuery("");

    const safeId = validateId(id, type);

    switch (type) {
      case "block":
        navigate(`/blocks/${safeId}`);
        break;
      case "transaction":
        navigate(`/transactions/${safeId}`);
        break;
      case "account":
        navigate(`/accounts/${safeId}`);
        break;
      case "contract":
        navigate(`/contracts/${safeId}`);
        break;
      case "token":
        navigate(`/tokens/${safeId}`);
        break;
      case "validator":
        navigate(`/validators/${safeId}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
    }
  };

  // Function to get icon for search result type
  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case "block":
        return (
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1 flex-shrink-0">
            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
            </svg>
          </div>
        );
      case "transaction":
        return (
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1 flex-shrink-0">
            <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          </div>
        );
      case "account":
        return (
          <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-1 flex-shrink-0">
            <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "contract":
        return (
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-1 flex-shrink-0">
            <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "token":
        return (
          <div className="rounded-full bg-pink-100 dark:bg-pink-900/30 p-1 flex-shrink-0">
            <svg className="w-3 h-3 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
        );
      case "validator":
        return (
          <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-1 flex-shrink-0">
            <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-1 flex-shrink-0">
            <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <form onSubmit={handleSearch} role="search">
        <label htmlFor="search-input" className="sr-only">Search</label>
        <div
          className={`relative transition-all duration-200 group ${
            isFocused
              ? "ring-2 ring-primary-500/50 dark:ring-secondary-400/60"
              : ""
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
            id="search-input"
            ref={inputRef}
            type="text"
            className="block w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-3.5 border border-gray-200/70 dark:border-gray-700/70 rounded-xl leading-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary-300/70 dark:focus:border-secondary-600/50 text-sm md:text-base transition-all duration-200 shadow-md hover:shadow-lg text-gray-800 dark:text-gray-200"
            placeholder={placeholder}
            value={query}
            maxLength={100}
            onChange={(e) => {
              // Only allow alphanumeric characters, spaces, and some special chars
              const input = e.target.value;
              const allowedChars = /^[a-zA-Z0-9 _\-:.#@]*$/;

              // Only update if input is valid or empty
              if (input === "" || allowedChars.test(input)) {
                setQuery(input);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              if (sanitizedQuery.length > 2) {
                setIsOpen(true);
              }
            }}
            onBlur={() => {
              // Delay to allow click events on search results
              setTimeout(() => {
                if (!isOpen) {
                  setIsFocused(false);
                }
              }, 100);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={isOpen ? "search-results" : undefined}
            aria-activedescendant={selectedResultIndex >= 0 ? `search-result-${selectedResultIndex}` : undefined}
          />
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="absolute inset-y-0 right-12 pr-2 sm:pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          {showHotkey && (
            <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
              <span className="flex items-center justify-center h-5 w-5 text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 opacity-70">
                /
              </span>
            </div>
          )}
        </div>
      </form>

      {isOpen && query.length > 2 && (
        <div 
          id="search-results"
          ref={resultsRef}
          className="absolute z-10 mt-2 w-full bg-white/95 dark:bg-gray-800/95 shadow-xl rounded-lg overflow-hidden max-h-96 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70"
          role="listbox"
        >
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
            <div className="py-1 overflow-y-auto max-h-96">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  id={`search-result-${index}`}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                    selectedResultIndex === index ? "bg-gray-50 dark:bg-gray-700" : ""
                  }`}
                  onClick={() => handleResultClick(result.type, result.id)}
                  role="option"
                  aria-selected={selectedResultIndex === index}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {getResultTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center truncate">
                        <span className="capitalize mr-1">{result.type}:</span>
                        <span className="truncate font-mono">{result.id}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 2 ? (
            <div className="px-4 py-4 text-gray-500 dark:text-gray-400 text-center">
              No results found for "{query}"
              <div className="text-xs mt-1">
                Try searching by block number, transaction hash, address, or token symbol
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

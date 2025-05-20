import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useNetworkStats } from "../../contexts/ApiContext";
// import SearchBar from "../ui/SearchBar";
import {
  MoonIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ServerIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: networkStats } = useNetworkStats();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const location = useLocation();

  // Function to determine if a navigation link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Navigation links with icons
  const navLinks = [
    {
      path: "/blocks",
      label: "Blocks",
      icon: <CubeIcon className="h-4 w-4" />,
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: <ArrowsRightLeftIcon className="h-4 w-4" />,
    },
    {
      path: "/accounts",
      label: "Accounts",
      icon: <UserIcon className="h-4 w-4" />,
    },
    {
      path: "/contracts",
      label: "Contracts",
      icon: <DocumentTextIcon className="h-4 w-4" />,
    },
    {
      path: "/tokens",
      label: "Tokens",
      icon: <CurrencyDollarIcon className="h-4 w-4" />,
    },
    {
      path: "/validators",
      label: "Validators",
      icon: <ServerIcon className="h-4 w-4" />,
    },
  ];

  const toggleDropdown = (dropdown: string) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        {/* Network Stats Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 py-1 border-b border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="font-medium mr-1">SEL Price:</span>
                  <span className="text-green-600 dark:text-green-400">
                    $0.0123 (+2.5%)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">Gas:</span>
                  <span>1.2 Gwei</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">TPS:</span>
                  <span>12.5</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="font-medium mr-1">Market Cap:</span>
                  <span>$12.5M</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">Total Txns:</span>
                  <span>1.2M</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img
                  src="/explorer-logo.png"
                  alt="Selendra Logo"
                  className="h-20 w-20 mr-3"
                />
                <span className="text-xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Selendra Explorer
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-2 mx-4 flex-1 justify-center">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(path)
                      ? "text-primary-600 dark:text-secondary-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}
              
              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("more")}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center
                    ${
                      activeDropdown === "more"
                        ? "text-primary-600 dark:text-secondary-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    }`}
                >
                  <span>More</span>
                  <ChevronDownIcon
                    className={`ml-1 h-4 w-4 transition-transform ${
                      activeDropdown === "more" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "more" && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 z-50">
                    <div className="py-1">
                      <Link
                        to="/charts"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Charts & Stats
                      </Link>
                      <Link
                        to="/api"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        API
                      </Link>
                      <Link
                        to="/verify"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Verify Contract
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search Button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                onClick={() => setSearchExpanded(!searchExpanded)}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Latest Block Indicator */}
              {networkStats && (
                <div className="hidden sm:flex text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full items-center border border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/blocks/${networkStats.latestBlock}`}
                    className="text-primary-600 dark:text-secondary-400 font-medium hover:underline flex items-center"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-success-500 animate-pulse mr-1.5"></span>
                    #{networkStats.latestBlock.toLocaleString()}
                  </Link>
                </div>
              )}

              {/* Connect Wallet Button */}
              <div className="relative">
                <button
                  className="flex items-center text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2 rounded-full border border-transparent hover:opacity-90 transition-all shadow-sm"
                >
                  <span className="mr-1">Connect Wallet</span>
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive(path)
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-2">{icon}</span>
                  {label}
                </Link>
              ))}

              {/* More section for mobile */}
              <div>
                <button
                  onClick={() => toggleDropdown("mobile-more")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium
                    ${
                      activeDropdown === "mobile-more"
                        ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    }`}
                >
                  <span>More</span>
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform ${
                      activeDropdown === "mobile-more" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "mobile-more" && (
                  <div className="mt-2 pl-4 space-y-1">
                    <Link
                      to="/charts"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Charts & Stats
                    </Link>
                    <Link
                      to="/api"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      API
                    </Link>
                    <Link
                      to="/verify"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Verify Contract
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            <div className="px-4 pt-3 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <button 
                  className="w-full flex items-center justify-center text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2.5 rounded-md border border-transparent hover:opacity-90 transition-all shadow-sm"
                >
                  Connect Wallet
                </button>
              </div>

              {networkStats && (
                <div className="flex justify-between items-center px-2 py-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Latest Block:</div>
                  <Link
                    to={`/blocks/${networkStats.latestBlock}`}
                    className="text-primary-600 dark:text-secondary-400 font-medium hover:underline flex items-center"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-success-500 animate-pulse mr-1.5"></span>
                    #{networkStats.latestBlock.toLocaleString()}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

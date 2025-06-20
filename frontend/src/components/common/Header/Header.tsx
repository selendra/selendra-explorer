import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../../content";
import { useNetworkInfo } from '../../../hooks';
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
  ChartBarIcon,
  CodeBracketIcon,
  FingerPrintIcon,
  CheckBadgeIcon,
  BookmarkIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: networkInfo } = useNetworkInfo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

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
      <header
        className={`sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-shadow ${
          isScrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        {/* Network Stats Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 py-1.5 border-b border-gray-200 dark:border-gray-700 hidden md:block overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="font-medium mr-1.5">SEL:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    $0.0123 (+2.5%)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1.5">Gas:</span>
                  <span>1.2 Gwei</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1.5">TPS:</span>
                  <span>12.5</span>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="font-medium mr-1.5">Market Cap:</span>
                  <span>$12.5M</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1.5">Total Txns:</span>
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
                  src="/sel/logo.png"
                  alt="Selendra Logo"
                  className="h-12 w-12 mr-2"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Selendra Explorer
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-1 mx-4 flex-1 justify-center">
              {navLinks.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive(path)
                      ? "text-primary-600 dark:text-secondary-400 bg-primary-50 dark:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/60"
                  }`}
                >
                  <span className="mr-1.5">{icon}</span>
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
                        ? "text-primary-600 dark:text-secondary-400 bg-primary-50 dark:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/60"
                    }`}
                >
                  <span>More</span>
                  <ChevronDownIcon
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === "more" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "more" && (
                  <div className="absolute right-0 mt-1 w-52 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden">
                    <div className="py-1">
                      <Link
                        to="/charts"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <ChartBarIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-secondary-400" />
                        Charts & Stats
                      </Link>
                      <Link
                        to="/extrinsics"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <ArrowsRightLeftIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-secondary-400" />
                        Extrinsics
                      </Link>
                      <Link
                        to="/api"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <CodeBracketIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-secondary-400" />
                        API
                      </Link>
                      <Link
                        to="/verify"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <CheckBadgeIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-secondary-400" />
                        Verify Contract
                      </Link>
                      <Link
                        to="/identity"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <FingerPrintIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-secondary-400" />
                        Identity
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <BookmarkIcon className="h-4 w-4 mr-2 text-primary-500 dark:text-secondary-400" />
                        Saved Contracts
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search Button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                onClick={() => setSearchExpanded(!searchExpanded)}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Latest Block Indicator */}
              {networkInfo && (
                <div className="hidden sm:flex text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full items-center border border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/blocks/${networkInfo.latest_block_number}`}
                    className="text-primary-600 dark:text-secondary-400 font-medium hover:underline flex items-center"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-success-500 animate-pulse mr-1.5"></span>
                    #{networkInfo.latest_block_number.toLocaleString()}
                  </Link>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-secondary-400/50"
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

              {/* Staking Link */}
              <Link
                to="/staking"
                className="hidden sm:flex items-center text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-2 rounded-md hover:opacity-90 transition-all shadow-sm"
              >
                <ShieldCheckIcon className="h-4 w-4 mr-1.5" />
                Staking
              </Link>

              {/* Connect Wallet Button */}
              <button className="hidden sm:flex items-center text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-2 rounded-md hover:opacity-90 transition-all shadow-sm">
                Connect Wallet
              </button>

              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchExpanded && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <form className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                name="search"
                id="search-mobile"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search blocks, txns, accounts..."
              />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0 invisible"
          } overflow-hidden`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium ${
                  isActive(path)
                    ? "text-primary-600 dark:text-secondary-400 bg-primary-50 dark:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                }`}
              >
                <span className="mr-3">{icon}</span>
                {label}
              </Link>
            ))}

            <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  More
                </p>
              </div>
              <div className="mt-2 space-y-1">
                <Link
                  to="/charts"
                  className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  <ChartBarIcon className="h-5 w-5 mr-3 text-primary-500 dark:text-secondary-400" />
                  Charts & Stats
                </Link>
                <Link
                  to="/extrinsics"
                  className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  <ArrowsRightLeftIcon className="h-5 w-5 mr-3 text-primary-500 dark:text-secondary-400" />
                  Extrinsics
                </Link>
                <Link
                  to="/api"
                  className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  <CodeBracketIcon className="h-5 w-5 mr-3 text-primary-500 dark:text-secondary-400" />
                  API
                </Link>
                <Link
                  to="/verify"
                  className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  <CheckBadgeIcon className="h-5 w-5 mr-3 text-primary-500 dark:text-secondary-400" />
                  Verify Contract
                </Link>
                <Link
                  to="/identity"
                  className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  <FingerPrintIcon className="h-5 w-5 mr-3 text-primary-500 dark:text-secondary-400" />
                  Identity
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                >
                  <BookmarkIcon className="h-5 w-5 mr-3 text-primary-500 dark:text-secondary-400" />
                  Saved Contracts
                </Link>
              </div>
            </div>

            {/* Connect Wallet and Staking (Mobile) */}
            <div className="pt-2 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <Link
                  to="/staking"
                  className="w-full flex items-center justify-center text-base font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2.5 rounded-md border border-transparent hover:opacity-90 transition-all shadow-sm"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-3" />
                  Staking
                </Link>
                
                <button className="w-full flex items-center justify-center text-base font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2.5 rounded-md border border-transparent hover:opacity-90 transition-all shadow-sm">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
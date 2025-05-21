import React from "react";
import { Link } from "react-router-dom";
import {
  CubeIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  DocumentTextIcon,
  ServerIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  CodeBracketIcon,
  BeakerIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Top section with logo and newsletter */}
      <div className="max-w-7xl mx-auto pt-10 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <img
                src="/sel/logo.png"
                alt="Selendra Logo"
                className="h-16 w-16 mr-2"
              />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Selendra Explorer
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
              The block explorer for Selendra network,
              supporting both EVM and Wasm smart contracts.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Stay updated with Selendra
            </h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              />
              <button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-4 py-2 rounded-r-md text-sm font-medium transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main footer links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Explorer
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/blocks"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <CubeIcon className="h-4 w-4 mr-2" />
                  Blocks
                </Link>
              </li>
              <li>
                <Link
                  to="/transactions"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
                  Transactions
                </Link>
              </li>
              <li>
                <Link
                  to="/accounts"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Accounts
                </Link>
              </li>
              <li>
                <Link
                  to="/contracts"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Contracts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
              <BookOpenIcon className="h-4 w-4 mr-2" />
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://selendra.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 flex items-center"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Selendra Website
                </a>
              </li>
              <li>
                <a
                  href="https://docs.selendra.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/selendra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <CodeBracketIcon className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://selendra.org/faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <BeakerIcon className="h-4 w-4 mr-2" />
                  Faucet
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
              <ServerIcon className="h-4 w-4 mr-2" />
              Network
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://rpcx.selendra.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 12H2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 12V17C5 18.6569 6.34315 20 8 20H16C17.6569 20 19 18.6569 19 17V12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 12V7C5 5.34315 6.34315 4 8 4H16C17.6569 4 19 5.34315 19 7V12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  RPC Endpoint
                </a>
              </li>
              <li>
                <a
                  href="https://rpc.selendra.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 12H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3C13.6569 3 15 4.34315 15 6C15 7.65685 13.6569 9 12 9C10.3431 9 9 7.65685 9 6C9 4.34315 10.3431 3 12 3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 21C13.6569 21 15 19.6569 15 18C15 16.3431 13.6569 15 12 15C10.3431 15 9 16.3431 9 18C9 19.6569 10.3431 21 12 21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 12C4.65685 12 6 10.6569 6 9C6 7.34315 4.65685 6 3 6C1.34315 6 0 7.34315 0 9C0 10.6569 1.34315 12 3 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12C22.6569 12 24 10.6569 24 9C24 7.34315 22.6569 6 21 6C19.3431 6 18 7.34315 18 9C18 10.6569 19.3431 12 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Substrate RPC
                </a>
              </li>
              <li>
                <Link
                  to="/validators"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <ServerIcon className="h-4 w-4 mr-2" />
                  Validators
                </Link>
              </li>
              <li>
                <Link
                  to="/tokens"
                  className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-secondary-400 flex items-center"
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Tokens
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Connect
            </h3>
            <div className="mt-4 flex flex-col space-y-4">
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/selendraorg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-secondary-400 transition-colors duration-200"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://github.com/selendra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-secondary-400 transition-colors duration-200"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://t.me/selendraorg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-secondary-400 transition-colors duration-200"
                >
                  <span className="sr-only">Telegram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.952z" />
                  </svg>
                </a>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Network Status
                </h4>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All systems operational
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and links */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Selendra Explorer. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link
              to="/terms"
              className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-secondary-400"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-secondary-400"
            >
              Privacy Policy
            </Link>
            <Link
              to="/api"
              className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-secondary-400"
            >
              API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

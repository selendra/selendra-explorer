import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface HeroProps {
  title?: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "Explore Selendra Network",
  subtitle,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="w-full flex flex-col min-h-[400px] sm:min-h-[440px] md:min-h-[500px] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-secondary-500/20 via-secondary-400/15 to-white dark:from-secondary-800/30 dark:via-secondary-900/25 dark:to-gray-900 overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-secondary-300/20 dark:bg-secondary-700/20 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-primary-300/15 dark:bg-primary-800/15 blur-2xl"></div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMjkgMjlIMWwxLTFoMjd2MXptMzAgMEgzMGwxLTFoMjh2MXptLTMwIDMwSDF2LTFoMjh2MXptMzAgMEgzMHYtMWgyOXYxek0xIDFoMjh2MUgyVjJIMXYtMXptMCAwaDI4djFIMlYySDEgMXptMCAzMGgxVjJIMVYxeiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      </div>

      {/* Content container */}
      <div className="relative w-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full py-12 md:py-16">
        {/* Hero content */}
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6 tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              {subtitle}
            </p>
          )}

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="relative w-full max-w-2xl mx-auto"
          >
            <div className="flex items-center rounded-xl bg-white/95 dark:bg-gray-800/95 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <input
                type="text"
                placeholder="Search by Address / Txn Hash / Block / Token / Contract"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 sm:py-5 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                aria-label="Search"
              />
              <button
                type="submit"
                className="px-5 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 transition-colors duration-200 flex items-center"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </form>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-center text-sm bg-white/70 dark:bg-gray-800/70 p-2.5 rounded-lg backdrop-blur-sm shadow-sm border border-gray-200/60 dark:border-gray-700/60">
              <div className="rounded-full bg-secondary-100 dark:bg-secondary-900/50 p-1.5 mr-2.5">
                <svg
                  className="w-4 h-4 text-secondary-600 dark:text-secondary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-200">
                EVM + Wasm Support
              </span>
            </div>
            <div className="flex items-center justify-center text-sm bg-white/70 dark:bg-gray-800/70 p-2.5 rounded-lg backdrop-blur-sm shadow-sm border border-gray-200/60 dark:border-gray-700/60">
              <div className="rounded-full bg-secondary-100 dark:bg-secondary-900/50 p-1.5 mr-2.5">
                <svg
                  className="w-4 h-4 text-secondary-600 dark:text-secondary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-200">
                Validator Dashboard
              </span>
            </div>
            <div className="flex items-center justify-center text-sm bg-white/70 dark:bg-gray-800/70 p-2.5 rounded-lg backdrop-blur-sm shadow-sm border border-gray-200/60 dark:border-gray-700/60">
              <div className="rounded-full bg-secondary-100 dark:bg-secondary-900/50 p-1.5 mr-2.5">
                <svg
                  className="w-4 h-4 text-secondary-600 dark:text-secondary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-200">
                Wallet Integration
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-10 flex justify-center space-x-3 sm:space-x-4">
            <a
              href="https://github.com/selendra"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/80 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 text-gray-700 dark:text-gray-200 hover:bg-white hover:dark:bg-gray-800 transition-colors flex items-center shadow-sm"
            >
              Developer Docs
              <ArrowRightIcon className="h-3.5 w-3.5 ml-1.5" />
            </a>
            <a
              href="https://selendra.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/80 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 text-gray-700 dark:text-gray-200 hover:bg-white hover:dark:bg-gray-800 transition-colors flex items-center shadow-sm"
            >
              About Selendra
              <ArrowRightIcon className="h-3.5 w-3.5 ml-1.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

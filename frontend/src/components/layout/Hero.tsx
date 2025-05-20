import React from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface HeroProps {
  title?: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "Explore Selendra Blockchain",
  subtitle,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="w-full flex flex-col md:flex-row min-h-[400px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[580px] overflow-hidden shadow-lg relative">
      {/* Background with blue-dominant gradient overlay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-secondary-600/40 via-secondary-500/35 to-secondary-400/30 overflow-hidden">
        {/* Blue-dominant decorative elements */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-secondary-400/20 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-secondary-300/25 blur-2xl animate-float-medium"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-secondary-500/15 blur-3xl animate-float-fast"></div>
        
        {/* Purple accent elements */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-primary-400/10 blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/5 w-40 h-40 rounded-full bg-primary-300/10 blur-xl"></div>
        
        {/* Enhanced grid pattern overlay with blue tint */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-secondary-200/15 to-secondary-400/10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMjkgMjlIMWwxLTFoMjd2MXptMzAgMEgzMGwxLTFoMjh2MXptLTMwIDMwSDF2LTFoMjh2MXptMzAgMEgzMHYtMWgyOXYxek0xIDFoMjh2MUgyVjJIMXYtMXptMCAwaDI4djFIMlYySDEgMXptMCAzMGgxVjJIMVYxeiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      </div>

      {/* Content container */}
      <div className="relative w-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center md:justify-between h-full pt-12 md:pt-16 pb-6 md:pb-10">
        {/* Left side with title and search */}
        <div className="w-full md:w-3/5 py-10 sm:py-12 md:py-0 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6 sm:mb-8 tracking-tight drop-shadow-md">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-gray-600 dark:text-white/80 text-lg sm:text-xl max-w-xl mb-8 leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Search Bar with removed border */}
          <form
            onSubmit={handleSearch}
            className="relative w-full max-w-2xl mx-auto md:mx-0 animate-fade-in"
          >
            <div className="flex items-center rounded-lg bg-white/95 dark:bg-gray-800/90 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 backdrop-blur-sm">
              <input
                type="text"
                placeholder="Search by Address / Txn Hash / Block / Token / Contract"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 sm:py-5 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="px-5 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 transition-colors duration-200 shadow-lg"
              >
                <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </form>

          {/* Feature highlights with blue-dominant styling */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl mx-auto md:mx-0">
            <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm bg-white/40 dark:bg-gray-800/40 p-2 rounded-md backdrop-blur-sm shadow-sm">
              <div className="rounded-full bg-secondary-100 dark:bg-secondary-900/30 p-1.5 mr-2">
                <svg className="w-4 h-4 text-secondary-600 dark:text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <span>EVM + Wasm Support</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm bg-white/40 dark:bg-gray-800/40 p-2 rounded-md backdrop-blur-sm shadow-sm">
              <div className="rounded-full bg-secondary-100 dark:bg-secondary-900/30 p-1.5 mr-2">
                <svg className="w-4 h-4 text-secondary-600 dark:text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <span>Validator Dashboard</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm bg-white/40 dark:bg-gray-800/40 p-2 rounded-md backdrop-blur-sm shadow-sm">
              <div className="rounded-full bg-secondary-100 dark:bg-secondary-900/30 p-1.5 mr-2">
                <svg className="w-4 h-4 text-secondary-600 dark:text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Wallet Integration</span>
            </div>
          </div>
        </div>

        {/* Right side with blue-dominant floating illustration */}
        <div className="hidden md:flex md:w-2/5 justify-center items-center">
          <div className="relative w-80 h-80">
            {/* Central sphere with blue-dominant styling */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 via-secondary-100/60 to-secondary-300/60 shadow-lg flex items-center justify-center animate-pulse-glow">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-secondary-200/70 via-secondary-300/60 to-secondary-400/60 blur-sm"></div>
              <img src="/selendra-icon.png" alt="Selendra Icon" className="w-24 h-24 object-contain relative z-10" />
            </div>
            
            {/* Blue-dominant orbiting elements */}
            <div className="absolute w-full h-full animate-spin-slow">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-secondary-400/50 rounded-full opacity-30 blur-sm"></div>
            </div>
            <div className="absolute w-full h-full animate-spin-slow-reverse">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-secondary-300/60 rounded-full opacity-30 blur-sm"></div>
            </div>
            <div className="absolute w-full h-full animate-spin-medium">
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-14 h-14 bg-secondary-500/50 rounded-full opacity-30 blur-sm"></div>
            </div>
            <div className="absolute w-full h-full animate-spin-medium-reverse">
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-10 h-10 bg-secondary-400/50 rounded-full opacity-30 blur-sm"></div>
            </div>
            
            {/* Purple accent orbital elements */}
            <div className="absolute w-full h-full animate-spin-slow" style={{animationDelay: '0.5s'}}>
              <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-primary-400/30 rounded-full opacity-40 blur-sm"></div>
            </div>
            <div className="absolute w-full h-full animate-spin-medium-reverse" style={{animationDelay: '0.8s'}}>
              <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-primary-500/30 rounded-full opacity-40 blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

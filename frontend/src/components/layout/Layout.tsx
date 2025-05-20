import { type ReactNode, type FC } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SearchBar from "../ui/SearchBar";
import { useLocation } from "react-router-dom";
import Hero from "./Hero";

interface LayoutProps {
  children: ReactNode;
  showHero?: boolean;
}

const Layout: FC<LayoutProps> = ({ children, showHero = true }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // This is for the smaller search hero on SUB-PAGES
  const shouldShowSubPageSearchHero = showHero && !isHomePage;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <Header />

      {isHomePage && (
        <Hero title="Explore Selendra Universe" subtitle="The comprehensive blockchain explorer for Selendra network, supporting both EVM and Wasm smart contracts." />
      )}

      {shouldShowSubPageSearchHero && (
        <div className="bg-gradient-to-br from-primary-500/10 via-white to-secondary-500/10 dark:from-primary-600/15 dark:via-gray-900 dark:to-secondary-600/15 shadow-md py-4 sm:py-5">
          <div className="container mx-auto">
            <div className="max-w-3xl px-4 sm:px-0 mx-auto">
              <SearchBar className="shadow-lg" />
            </div>
          </div>
        </div>
      )}

      <main className={`flex-grow ${!isHomePage ? 'container mx-auto' : ''} py-6 sm:py-8 lg:py-10`}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;

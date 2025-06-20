import { type ReactNode, type FC, useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Hero } from "../Hero";

import SearchBar from "../../ui/SearchBar";

interface LayoutProps {
  children?: ReactNode; // Make children optional
  showHero?: boolean;
}

const Layout: FC<LayoutProps> = ({ showHero = true }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Set page as loaded after a short delay to allow for smooth animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // This is for the smaller search hero on sub-pages
  const shouldShowSubPageSearchHero = showHero && !isHomePage;

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />

      {isHomePage && (
        <Hero
          title="Explore Selendra Network"
          // subtitle="EVM and Wasm Block Explorer"
        />
      )}

      {shouldShowSubPageSearchHero && (
        <div className="bg-gradient-to-r from-secondary-50/50 via-white to-primary-50/50 dark:from-secondary-900/20 dark:via-gray-900 dark:to-primary-900/20 shadow-sm py-4 sm:py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <SearchBar placeholder="Search by Address / Txn Hash / Block / Token..." />

              {/* Current page breadcrumb */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center px-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-400 dark:bg-primary-500 mr-1.5 opacity-70"></span>
                <span>
                  {location.pathname
                    .split("/")
                    .filter(Boolean)
                    .map((segment, index, array) => {
                      // Capitalize and replace hyphens with spaces
                      const formattedSegment = segment
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ");

                      return index === array.length - 1 ? (
                        <span
                          key={segment}
                          className="font-medium text-gray-700 dark:text-gray-300"
                        >
                          {formattedSegment}
                        </span>
                      ) : (
                        <span key={segment}>{formattedSegment} / </span>
                      );
                    })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial="initial"
          animate={isPageLoaded ? "animate" : "initial"}
          exit="exit"
          variants={pageVariants}
          className={`flex-grow ${
            !isHomePage ? "container mx-auto px-4 sm:px-6" : ""
          } py-6 sm:py-8 lg:py-10`}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Layout;
import { type FC, type ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: string;
  isPositiveChange?: boolean;
  className?: string;
  isLoading?: boolean;
  subtitle?: string;
  accentColor?: string;
}

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  isPositiveChange = true,
  className = "",
  isLoading = false,
  subtitle,
  accentColor = "primary",
}) => {
  // Define color classes based on accentColor
  const getColorClasses = () => {
    switch (accentColor) {
      case "accent":
        return {
          iconBg:
            "from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30",
          iconText: "text-accent-600 dark:text-accent-400",
          border: "border-accent-200 dark:border-accent-800",
          gradient: "from-transparent via-accent-500/20 to-transparent",
          hover: "hover:border-accent-300 dark:hover:border-accent-700",
        };
      case "secondary":
        return {
          iconBg:
            "from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30",
          iconText: "text-secondary-600 dark:text-secondary-400",
          border: "border-secondary-200 dark:border-secondary-800",
          gradient: "from-transparent via-secondary-500/20 to-transparent",
          hover: "hover:border-secondary-300 dark:hover:border-secondary-700",
        };
      case "success":
        return {
          iconBg:
            "from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30",
          iconText: "text-success-600 dark:text-success-400",
          border: "border-success-200 dark:border-success-800",
          gradient: "from-transparent via-success-500/20 to-transparent",
          hover: "hover:border-success-300 dark:hover:border-success-700",
        };
      case "warning":
        return {
          iconBg:
            "from-warning-100 to-warning-200 dark:from-warning-900/30 dark:to-warning-800/30",
          iconText: "text-warning-600 dark:text-warning-400",
          border: "border-warning-200 dark:border-warning-800",
          gradient: "from-transparent via-warning-500/20 to-transparent",
          hover: "hover:border-warning-300 dark:hover:border-warning-700",
        };
      default:
        return {
          iconBg:
            "from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30",
          iconText: "text-primary-600 dark:text-primary-400",
          border: "border-primary-200 dark:border-primary-800",
          gradient: "from-transparent via-primary-500/20 to-transparent",
          hover: "hover:border-primary-300 dark:hover:border-primary-700",
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div
      className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border ${colorClasses.border} ${colorClasses.hover} p-5 transition-all duration-300 hover-lift ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
            {title}
            {subtitle && (
              <span className="ml-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                {subtitle}
              </span>
            )}
          </p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
          {change && !isLoading && (
            <p
              className={`mt-2 text-sm font-medium flex items-center ${
                isPositiveChange
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                  : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
              } px-2 py-0.5 rounded-full w-fit`}
            >
              <span className="mr-1">
                {isPositiveChange ? (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 15l7-7 7 7"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                )}
              </span>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-full bg-gradient-to-br ${colorClasses.iconBg} ${colorClasses.iconText} shadow-sm`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div
        className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses.gradient}`}
      ></div>
      <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 rounded-full bg-gray-50 dark:bg-gray-700 opacity-10"></div>

      {/* Information tooltip */}
      <div className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help group">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <p className="font-medium mb-1">{title}</p>
          <p className="text-gray-500 dark:text-gray-400">
            {subtitle ? `${subtitle} - ` : ""}
            This statistic shows {title.toLowerCase()} on the Selendra network.
            {change && ` There has been a change of ${change} recently.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

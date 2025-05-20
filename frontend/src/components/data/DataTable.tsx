import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  bordered?: boolean;
  striped?: boolean;
  compact?: boolean;
  rounded?: boolean;
  highlightOnHover?: boolean;
  loadingRows?: number;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No data available",
  className = "",
  bordered = false,
  striped = false,
  compact = false,
  rounded = true,
  highlightOnHover = true,
  loadingRows = 5,
}: DataTableProps<T>) {
  // Generate table style classes
  const tableClasses = [
    "min-w-full",
    "divide-y",
    "divide-gray-200",
    "dark:divide-gray-700",
    bordered ? "border border-gray-200 dark:border-gray-700" : "",
    rounded ? "rounded-lg overflow-hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const headerClasses = [
    "bg-gray-50",
    "dark:bg-gray-800",
    bordered ? "border-b border-gray-200 dark:border-gray-700" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const headerCellClasses = [
    "px-6",
    compact ? "py-2" : "py-3",
    "text-left",
    "text-xs",
    "font-medium",
    "text-gray-500",
    "dark:text-gray-400",
    "uppercase",
    "tracking-wider",
  ]
    .filter(Boolean)
    .join(" ");

  const bodyCellClasses = [
    "px-6",
    compact ? "py-2" : "py-4",
    "whitespace-nowrap",
    "text-sm",
    "text-gray-700",
    "dark:text-gray-300",
  ]
    .filter(Boolean)
    .join(" ");

  const rowClasses = [
    highlightOnHover ? "hover:bg-gray-50 dark:hover:bg-gray-700" : "",
    "transition-colors",
    "duration-150",
  ]
    .filter(Boolean)
    .join(" ");

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <div
          className={`${
            rounded ? "rounded-lg overflow-hidden" : ""
          } border border-gray-200 dark:border-gray-700 shadow-sm`}
        >
          <table className={tableClasses}>
            <thead className={headerClasses}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`${headerCellClasses} ${column.className || ""}`}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && (
                        <svg
                          className="ml-1 w-3 h-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          ></path>
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(loadingRows)].map((_, index) => (
                <tr
                  key={index}
                  className={
                    striped && index % 2 === 1
                      ? "bg-gray-50 dark:bg-gray-900/30"
                      : ""
                  }
                >
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className={bodyCellClasses}>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <div
          className={`${
            rounded ? "rounded-lg overflow-hidden" : ""
          } border border-gray-200 dark:border-gray-700 shadow-sm`}
        >
          <table className={tableClasses}>
            <thead className={headerClasses}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`${headerCellClasses} ${column.className || ""}`}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && (
                        <svg
                          className="ml-1 w-3 h-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          ></path>
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render data table
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div
        className={`${
          rounded ? "rounded-lg overflow-hidden" : ""
        } border border-gray-200 dark:border-gray-700 shadow-sm`}
      >
        <table className={tableClasses}>
          <thead className={headerClasses}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`${headerCellClasses} ${column.className || ""}`}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && (
                      <svg
                        className="ml-1 w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        ></path>
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item)}
                className={`${rowClasses} ${
                  striped && rowIndex % 2 === 1
                    ? "bg-gray-50 dark:bg-gray-900/30"
                    : ""
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={bodyCellClasses}>
                    {typeof column.accessor === "function"
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

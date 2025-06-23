import React from 'react';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  highlightOnHover?: boolean;
  striped?: boolean;
  className?: string;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No data available",
  highlightOnHover = false,
  striped = false,
  className = ""
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-50 dark:bg-gray-800 p-4">
            <div className="grid grid-cols-4 gap-4">
              {columns.map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-4 gap-4">
                {columns.map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`w-full text-center py-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              className={`
                ${striped && index % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700/30' : ''}
                ${highlightOnHover ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}
                transition-colors duration-150
              `}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${column.className || ''}`}
                >
                  {column.accessor(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
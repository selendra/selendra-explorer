import React, { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Skeleton from './Skeleton';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  headerClassName?: string;
  cellClassName?: string;
  sortable?: boolean;
}

export interface PaginationOptions {
  pageSize: number;
  totalItems: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  noDataMessage?: string;
  className?: string;
  pagination?: PaginationOptions;
  onRowClick?: (row: T) => void;
  rowClassName?: string | ((row: T) => string);
  stickyHeader?: boolean;
  sortable?: boolean;
  defaultSortField?: keyof T;
  defaultSortOrder?: 'asc' | 'desc';
  onSortChange?: (field: keyof T, order: 'asc' | 'desc') => void;
  testId?: string;
}

function DataTable<T extends object>({
  columns,
  data,
  keyField,
  isLoading = false,
  noDataMessage = 'No data available',
  className = '',
  pagination,
  onRowClick,
  rowClassName,
  stickyHeader = false,
  sortable = false,
  defaultSortField,
  defaultSortOrder = 'asc',
  onSortChange,
  testId,
}: DataTableProps<T>) {
  // Sorting state
  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  // Handle sort
  const handleSort = (accessor: keyof T) => {
    if (!sortable) return;
    
    // If clicking the same field, toggle order
    if (sortField === accessor) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      if (onSortChange) onSortChange(accessor, newOrder);
    } else {
      // New field, set to default order
      setSortField(accessor);
      setSortOrder(defaultSortOrder);
      if (onSortChange) onSortChange(accessor, defaultSortOrder);
    }
  };

  // Handle row click
  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Get computed row class name
  const getRowClassName = (row: T) => {
    let baseClasses = 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50';
    
    if (onRowClick) {
      baseClasses += ' cursor-pointer';
    }

    if (typeof rowClassName === 'function') {
      return `${baseClasses} ${rowClassName(row)}`;
    }
    
    return `${baseClasses} ${rowClassName || ''}`;
  };

  // Sort data if needed and not handled externally
  const sortedData = useMemo(() => {
    if (!sortable || !sortField || onSortChange) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortField as keyof T];
      const bValue = b[sortField as keyof T];

      // Handle undefined or null values
      if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
      if (bValue == null) return sortOrder === 'asc' ? 1 : -1;

      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Date comparison
      if (
        aValue instanceof Date && 
        bValue instanceof Date
      ) {
        return sortOrder === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Default comparison for other types
      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [data, sortField, sortOrder, sortable, onSortChange]);

  // Calculate pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const { pageSize, currentPage } = pagination;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    
    return sortedData.slice(start, end);
  }, [sortedData, pagination]);

  // Render table
  return (
    <div className={`overflow-x-auto w-full ${className}`} data-testid={testId}>
      <table className="min-w-full border-collapse table-auto">
        <thead className={`bg-gray-50 dark:bg-gray-800/50 text-left ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
          <tr>
            {columns.map((column, index) => {
              const isSortable = sortable && (typeof column.accessor === 'string') && (column.sortable !== false);
              const isSorted = isSortable && sortField === column.accessor;
              
              return (
                <th
                  key={index}
                  className={`px-4 py-3 font-medium text-sm text-gray-700 dark:text-gray-300 ${
                    isSortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                  } ${column.headerClassName || ''}`}
                  onClick={() => {
                    if (isSortable && typeof column.accessor === 'string') {
                      handleSort(column.accessor as keyof T);
                    }
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {isSortable && (
                      <span className="inline-flex flex-col">
                        <ChevronUpIcon
                          className={`h-3 w-3 -mb-1 ${
                            isSorted && sortOrder === 'asc'
                              ? 'text-primary-500 dark:text-secondary-400'
                              : 'text-gray-400 dark:text-gray-600'
                          }`}
                        />
                        <ChevronDownIcon
                          className={`h-3 w-3 -mt-1 ${
                            isSorted && sortOrder === 'desc'
                              ? 'text-primary-500 dark:text-secondary-400'
                              : 'text-gray-400 dark:text-gray-600'
                          }`}
                        />
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Loading state
            Array.from({ length: pagination?.pageSize || 5 }).map((_, rowIndex) => (
              <tr key={`loading-${rowIndex}`} className="border-b border-gray-100 dark:border-gray-800">
                {columns.map((_, colIndex) => (
                  <td key={`loading-${rowIndex}-${colIndex}`} className="px-4 py-3">
                    <Skeleton width="80%" height={18} />
                  </td>
                ))}
              </tr>
            ))
          ) : paginatedData.length > 0 ? (
            // Data rows
            paginatedData.map((row) => (
              <tr
                key={String(row[keyField])}
                className={getRowClassName(row)}
                onClick={() => handleRowClick(row)}
              >
                {columns.map((column, colIndex) => {
                  // Get cell value
                  const cellValue =
                    typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : row[column.accessor as keyof T];
                  
                  return (
                    <td
                      key={`${String(row[keyField])}-${colIndex}`}
                      className={`px-4 py-3 text-sm text-gray-800 dark:text-gray-200 ${column.cellClassName || ''}`}
                    >
                      {typeof cellValue === "object" && cellValue !== null && !React.isValidElement(cellValue)
  ? JSON.stringify(cellValue)
  : cellValue as React.ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            // No data
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
              >
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Showing{' '}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {pagination.totalItems > 0
                ? (pagination.currentPage - 1) * pagination.pageSize + 1
                : 0}
            </span>{' '}
            to{' '}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems
              )}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {pagination.totalItems}
            </span>{' '}
            items
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className={`p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                pagination.currentPage <= 1
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {calculatePageButtons(pagination.currentPage, Math.ceil(pagination.totalItems / pagination.pageSize)).map(
              (page, index) =>
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex items-center px-3 py-1.5 text-gray-600 dark:text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => pagination.onPageChange(page as number)}
                    className={`px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                      pagination.currentPage === page
                        ? 'bg-primary-500 text-white dark:bg-secondary-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )
            )}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={
                pagination.currentPage >=
                Math.ceil(pagination.totalItems / pagination.pageSize)
              }
              className={`p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                pagination.currentPage >=
                Math.ceil(pagination.totalItems / pagination.pageSize)
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Next page"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate page buttons to show
function calculatePageButtons(
  currentPage: number,
  totalPages: number
): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Complex pagination with ellipsis
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  } else if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  } else {
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }
}

export default DataTable;
import { useState, useMemo } from 'react';
import { SITE_CONSTANTS } from '../content';

export const usePagination = (totalItems, initialPageSize = SITE_CONSTANTS.FORMAT.DEFAULT_PAGE_SIZE) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const offset = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const goToNext = () => {
    goToPage(currentPage + 1);
  };

  const goToPrevious = () => {
    goToPage(currentPage - 1);
  };

  const goToFirst = () => {
    goToPage(1);
  };

  const goToLast = () => {
    goToPage(totalPages);
  };

  const reset = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    offset,
    setPageSize,
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    reset,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
};

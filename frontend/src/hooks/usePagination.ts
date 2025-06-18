import { useState, useMemo } from "react";
import { SITE_CONSTANTS } from "../content";
import { UsePaginationReturn } from "../types";

export const usePagination = (
  totalItems: number,
  initialPageSize: number = SITE_CONSTANTS.FORMAT.DEFAULT_PAGE_SIZE
): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const offset = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const goToPage = (page: number): void => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const goToNext = (): void => {
    goToPage(currentPage + 1);
  };

  const goToPrevious = (): void => {
    goToPage(currentPage - 1);
  };

  const goToFirst = (): void => {
    goToPage(1);
  };

  const goToLast = (): void => {
    goToPage(totalPages);
  };

  const reset = (): void => {
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

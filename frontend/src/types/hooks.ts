export interface UseApiOptions {
  immediate?: boolean;
  refreshInterval?: number | null;
  dependencies?: any[];
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (customParams?: any) => Promise<T>;
  refresh: () => Promise<T>;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  offset: number;
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  reset: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UseAddressConversionReturn {
  inputAddress: string;
  setInputAddress: (address: string) => void;
  addressType: "evm" | "ss58" | null;
  convertAddress: (address: string) => Promise<any>;
  reset: () => void;
  ss58Result: any;
  evmResult: any;
  loading: boolean;
  error: string | null;
}

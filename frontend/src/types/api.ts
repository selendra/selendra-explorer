export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface RequestOptions {
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}


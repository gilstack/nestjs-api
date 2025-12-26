export interface ApiMeta {
  timestamp: string;
  path: string;
  requestId: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: ApiErrorDetail[] | Record<string, unknown> | null;
}

export interface ApiErrorResponse {
  error: ApiError;
  meta: ApiMeta;
}

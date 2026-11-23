export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface ApiErrorResponse {
  message?: string;
  [key: string]: unknown;
}

export interface ValidationResponse {
  valid: boolean;
  statusCode: number;
  message?: string;
}

export interface ValidationRequestData {
  url: string;
}

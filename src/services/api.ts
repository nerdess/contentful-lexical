import { useSDK } from '@contentful/react-apps-toolkit';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  isAxiosError,
} from 'axios';
import { useMemo } from 'react';

import type {
  ApiErrorResponse,
  ApiResponse,
  ValidationRequestData,
  ValidationResponse,
} from './api.types';

class ApiService {
  private client: AxiosInstance;

  constructor(config: {
    baseURL: string;
    authToken?: string;
    timeout?: number;
    headers?: Record<string, string>;
  }) {
    if (!config.baseURL) {
      throw new Error('API base URL is required');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (config.authToken) {
      headers['Authorization'] = `Bearer ${config.authToken}`;
    }

    this.client = axios.create({
      baseURL: config.baseURL,
      headers,
      timeout: config.timeout || 10000,
    });
  }

  /**
   * Sets a new authorization token
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Sets the base URL for API requests
   */
  setBaseURL(url: string): void {
    this.client.defaults.baseURL = url;
  }

  /**
   * Sets a custom header
   */
  setHeader(name: string, value: string): void {
    this.client.defaults.headers.common[name] = value;
  }

  /**
   * Generic request method that handles all request types
   */
  private async request<T, D = unknown>(
    method: string,
    endpoint: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.request<T>({
        url: endpoint,
        method,
        data,
        ...config,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        const errorData = axiosError.response?.data;
        return {
          success: false,
          error: errorData?.message || axiosError.message || 'An error occurred',
          status: axiosError.response?.status || 0,
          data: undefined,
        };
      }

      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        error: errorMessage,
        status: 0,
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  /**
   * POST request
   */
  async post<T, D = unknown>(
    endpoint: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T, D>('POST', endpoint, data, config);
  }
}

export const API_NOT_CONFIGURED_ERROR =
  'API URL is not configured. Please set it in the app settings or the VITE_API_URL environment variable.';

export const createUrlValidator = (apiService: ApiService | null) => ({
  isConfigured: apiService !== null,
  validateUrl: (url: string): Promise<ApiResponse<ValidationResponse>> => {
    if (!apiService) {
      return Promise.resolve({ success: false, error: API_NOT_CONFIGURED_ERROR, status: 0 });
    }

    return apiService.post<ValidationResponse, ValidationRequestData>('/api/validate-url', {
      url,
    });
  },
});

/**
 * Custom hook to create and access the API service with Contentful SDK parameters
 */
export const useApiService = () => {
  const sdk = useSDK();

  // NOTE: parameters from Contentful's app configuration
  const parameters = sdk?.parameters?.instance || {};
  const apiURL: string | undefined = parameters.apiURL || import.meta.env.VITE_API_URL;
  const authToken: string | undefined = parameters.authToken || import.meta.env.VITE_AUTH_TOKEN;

  return useMemo(() => {
    const apiService = apiURL ? new ApiService({ baseURL: apiURL, authToken }) : null;

    return {
      apiService,
      urlValidator: createUrlValidator(apiService),
    };
  }, [apiURL, authToken]);
};

export { ApiService };

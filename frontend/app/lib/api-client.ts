/**
 * Centralized API Client for Backend Communication
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Request timeouts
 * - Standardized error handling
 * - Type-safe responses
 * - Request logging
 */

import { requestLogger } from '~/lib/logger';

// Get backend URL - works in both server and client contexts
function getBackendUrl(): string {
  const backendUrl = typeof  window === 'undefined' 
    ? process.env.BACKEND_URL 
    : (window as any).__ENV__?.BACKEND_URL || process.env.BACKEND_URL;
  
  if (!backendUrl) {
    throw new Error('BACKEND_URL environment variable is not set');
  }

  // Ensure it ends with /api/v1
  if (backendUrl.includes('/api/v1')) {
    return backendUrl;
  }
  
  return `${backendUrl}/api/v1`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  validateStatus?: (status: number) => boolean;
}

/**
 * Centralized API Client
 */
export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = getBackendUrl();
    this.defaultTimeout = 30000; // 30 seconds
    this.defaultRetries = 3;
    this.defaultRetryDelay = 1000; // 1 second
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make an HTTP request with retry logic and timeout
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      validateStatus = (status) => status >= 200 && status < 300,
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Log request start
    const startTime = requestLogger.logRequest(method, endpoint);

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if response status is valid
        if (!validateStatus(response.status)) {
          await this.handleErrorResponse(response);
        }

        // Log successful response
        requestLogger.logResponse(method, endpoint, response.status, startTime);

        // Validate content type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }

        // If not JSON, return text as fallback
        const text = await response.text();
        return text as any;

      } catch (error) {
        lastError = this.normalizeError(error);

        // Don't retry on client errors (4xx) or non-retryable errors
        if (
          error instanceof ApiError &&
          (error.status >= 400 && error.status < 500) &&
          !error.retryable
        ) {
          // Log error
          requestLogger.logError(method, endpoint, error, startTime);
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === retries) {
          // Log final error
          requestLogger.logError(method, endpoint, lastError, startTime);
          throw lastError;
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = response.statusText || 'Unknown error';
    let errorCode: string | undefined;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorCode = errorData.code || errorData.errorCode;
      }
    } catch {
      // Failed to parse error response, use status text
    }

    // Determine if error is retryable (5xx errors are retryable)
    const retryable = response.status >= 500;

    throw new ApiError(errorMessage, response.status, errorCode, retryable);
  }

  /**
   * Normalize different error types
   */
  private normalizeError(error: any): Error {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new TimeoutError();
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError('Network request failed. Please check your connection.');
    }

    return error instanceof Error ? error : new Error(String(error));
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Convenience methods
   */
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new ApiClient();

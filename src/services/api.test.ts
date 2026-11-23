import { renderHook } from '@testing-library/react';
import { AxiosAdapter, AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk: { parameters: { instance?: Record<string, unknown> } } = { parameters: {} };

vi.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => sdk,
}));

import { API_NOT_CONFIGURED_ERROR, ApiService, createUrlValidator, useApiService } from './api';

const respondWith = (status: number, data: unknown) => {
  const requests: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async config => {
    requests.push(config);
    const response = { data, status, statusText: '', headers: {}, config };
    if (status >= 400) {
      throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, null, response);
    }
    return response;
  };
  return { adapter, requests };
};

describe('ApiService', () => {
  it('requires a base URL', () => {
    expect(() => new ApiService({ baseURL: '' })).toThrow('API base URL is required');
  });

  it('returns data and status on success', async () => {
    const api = new ApiService({ baseURL: 'https://api.example.com' });
    const { adapter, requests } = respondWith(200, { ok: true });

    const result = await api.get('/ping', { adapter });

    expect(result).toEqual({ success: true, data: { ok: true }, status: 200 });
    expect(requests[0].method).toBe('get');
    expect(requests[0].baseURL).toBe('https://api.example.com');
    expect(requests[0].url).toBe('/ping');
  });

  it('sends the auth token, JSON content type and POST body', async () => {
    const api = new ApiService({ baseURL: 'https://api.example.com', authToken: 'secret' });
    const { adapter, requests } = respondWith(200, {});

    await api.post('/items', { name: 'x' }, { adapter });

    const headers = AxiosHeaders.from(requests[0].headers);
    expect(headers.get('Authorization')).toBe('Bearer secret');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(requests[0].method).toBe('post');
    expect(JSON.parse(requests[0].data)).toEqual({ name: 'x' });
  });

  it('can change the token, base URL and headers afterwards', async () => {
    const api = new ApiService({ baseURL: 'https://old.example.com' });
    api.setAuthToken('new-token');
    api.setBaseURL('https://new.example.com');
    api.setHeader('X-Custom', 'value');
    const { adapter, requests } = respondWith(200, {});

    await api.get('/', { adapter });

    const headers = AxiosHeaders.from(requests[0].headers);
    expect(requests[0].baseURL).toBe('https://new.example.com');
    expect(headers.get('Authorization')).toBe('Bearer new-token');
    expect(headers.get('X-Custom')).toBe('value');
  });

  it('returns the server error message for failed requests', async () => {
    const api = new ApiService({ baseURL: 'https://api.example.com' });
    const { adapter } = respondWith(422, { message: 'Invalid input' });

    const result = await api.post('/items', {}, { adapter });

    expect(result).toEqual({ success: false, error: 'Invalid input', status: 422, data: undefined });
  });

  it('falls back to the axios message when the server sends none', async () => {
    const api = new ApiService({ baseURL: 'https://api.example.com' });
    const { adapter } = respondWith(500, {});

    const result = await api.get('/', { adapter });

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toBe('Request failed with status code 500');
  });

  it('returns status 0 for network errors', async () => {
    const api = new ApiService({ baseURL: 'https://api.example.com' });
    const adapter: AxiosAdapter = async config => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    };

    const result = await api.get('/', { adapter });

    expect(result).toEqual({ success: false, error: 'Network Error', status: 0, data: undefined });
  });

  it('handles non-axios errors', async () => {
    const api = new ApiService({ baseURL: 'https://api.example.com' });
    const adapter: AxiosAdapter = async () => {
      throw new Error('boom');
    };

    const result = await api.get('/', { adapter });

    expect(result).toEqual({ success: false, error: 'boom', status: 0 });
  });
});

describe('createUrlValidator', () => {
  it('posts the URL to the validation endpoint', async () => {
    const api = new ApiService({ baseURL: 'https://api.example.com' });
    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue({ success: true, status: 200, data: { valid: true, statusCode: 200 } });

    const result = await createUrlValidator(api).validateUrl('https://example.com');

    expect(post).toHaveBeenCalledWith('/api/validate-url', { url: 'https://example.com' });
    expect(result.data?.valid).toBe(true);
  });

  it('reports whether an API is configured', () => {
    expect(createUrlValidator(new ApiService({ baseURL: 'https://api.example.com' })).isConfigured).toBe(
      true
    );
    expect(createUrlValidator(null).isConfigured).toBe(false);
  });

  it('resolves with an error when no API is configured', async () => {
    const result = await createUrlValidator(null).validateUrl('https://example.com');

    expect(result).toEqual({ success: false, error: API_NOT_CONFIGURED_ERROR, status: 0 });
  });
});

describe('useApiService', () => {
  beforeEach(() => {
    sdk.parameters = {};
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('VITE_AUTH_TOKEN', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not throw when no API URL is configured', () => {
    const { result } = renderHook(() => useApiService());

    expect(result.current.apiService).toBeNull();
  });

  it('uses the API URL from the Contentful app parameters', () => {
    sdk.parameters.instance = { apiURL: 'https://api.example.com', authToken: 'token' };
    const { result } = renderHook(() => useApiService());

    expect(result.current.apiService).toBeInstanceOf(ApiService);
  });

  it('falls back to the VITE_API_URL environment variable', () => {
    vi.stubEnv('VITE_API_URL', 'https://env.example.com');
    const { result } = renderHook(() => useApiService());

    expect(result.current.apiService).toBeInstanceOf(ApiService);
  });

  it('keeps the same service between renders', () => {
    sdk.parameters.instance = { apiURL: 'https://api.example.com' };
    const { result, rerender } = renderHook(() => useApiService());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});

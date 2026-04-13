/**
 * src/lib/__tests__/axios.test.ts
 *
 * Tests for the Axios instance created in src/lib/axios.ts.
 *
 * Strategy: reach into the private interceptor managers to call the
 * request/response handlers in isolation — no real HTTP traffic.
 * The Supabase mock is obtained via jest.requireMock() so that we share
 * exactly the same mock instance that was registered by jest.setup.ts.
 */

import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import Toast from 'react-native-toast-message';

// Access the supabase.auth object that axios.ts actually uses.
// supabase.ts calls createClient() at module load time and stores the result.
// We import the same module so we get the exact same auth object.
// Because @supabase/supabase-js is mocked by jest.setup.ts, supabase.auth
// is the mock object returned by the mocked createClient factory.
import { supabase } from '../supabase';

// Import the module under test AFTER mocks are registered.
import api from '../axios';

function getSupabaseAuthMock() {
  return supabase.auth as unknown as {
    getSession: jest.Mock;
    setSession: jest.Mock;
    signOut: jest.Mock;
    onAuthStateChange: jest.Mock;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRequestInterceptor() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manager = (api.interceptors.request as any).handlers;
  const handler = manager[manager.length - 1];
  if (!handler) throw new Error('No request interceptor found');
  return handler.fulfilled as (
    config: InternalAxiosRequestConfig,
  ) => Promise<InternalAxiosRequestConfig>;
}

function getResponseInterceptors() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manager = (api.interceptors.response as any).handlers;
  const handler = manager[manager.length - 1];
  if (!handler) throw new Error('No response interceptor found');
  return {
    onFulfilled: handler.fulfilled as (res: AxiosResponse) => AxiosResponse,
    onRejected: handler.rejected as (err: unknown) => Promise<never>,
  };
}

function makeConfig(url = '/some/endpoint'): InternalAxiosRequestConfig {
  // Create a fresh headers object for each config so tests don't bleed
  return {
    url,
    headers: { ...axios.defaults.headers.common },
  } as unknown as InternalAxiosRequestConfig;
}

function makeError(status: number, url = '/some/endpoint', data: unknown = {}) {
  return Object.assign(new Error('Request failed'), {
    response: { status, data },
    config: { url },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Axios instance (src/lib/axios.ts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- baseURL ----

  describe('baseURL', () => {
    it('uses the default fallback URL when EXPO_PUBLIC_API_URL is not set', () => {
      expect(api.defaults.baseURL).toBe(
        process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api',
      );
    });

    it('has a 15-second timeout', () => {
      expect(api.defaults.timeout).toBe(15000);
    });
  });

  // ---- Request interceptor ----

  describe('request interceptor', () => {
    it('attaches Authorization Bearer header when a session exists', async () => {
      const auth = getSupabaseAuthMock();
      auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: 'tok-abc-123' } },
        error: null,
      });

      const result = await getRequestInterceptor()(makeConfig());

      expect(result.headers.Authorization).toBe('Bearer tok-abc-123');
    });

    it('does not attach Authorization header when there is no session', async () => {
      const auth = getSupabaseAuthMock();
      auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await getRequestInterceptor()(makeConfig());

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  // ---- Response interceptor — success path ----

  describe('response interceptor — success', () => {
    it('unwraps response.data.data when the data envelope is present', () => {
      const { onFulfilled } = getResponseInterceptors();
      const response = {
        data: { data: { id: '1', name: 'Test' } },
        status: 200,
      } as unknown as AxiosResponse;

      const result = onFulfilled(response);

      expect(result.data).toEqual({ id: '1', name: 'Test' });
    });

    it('leaves response.data intact when there is no data envelope', () => {
      const { onFulfilled } = getResponseInterceptors();
      const response = {
        data: [1, 2, 3],
        status: 200,
      } as unknown as AxiosResponse;

      const result = onFulfilled(response);

      expect(result.data).toEqual([1, 2, 3]);
    });

    it('leaves response.data intact when response.data has no "data" key', () => {
      const { onFulfilled } = getResponseInterceptors();
      const response = {
        data: { items: [], pagination: {} },
        status: 200,
      } as unknown as AxiosResponse;

      const result = onFulfilled(response);

      expect(result.data).toEqual({ items: [], pagination: {} });
    });
  });

  // ---- Response interceptor — error path ----

  describe('response interceptor — errors', () => {
    it('calls supabase.auth.signOut on 401 from a non-auth endpoint', async () => {
      const auth = getSupabaseAuthMock();
      const { onRejected } = getResponseInterceptors();

      await expect(onRejected(makeError(401, '/transfers'))).rejects.toThrow();

      expect(auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('shows a "Session expired" toast on 401 from a non-auth endpoint', async () => {
      const { onRejected } = getResponseInterceptors();

      await expect(onRejected(makeError(401, '/transfers'))).rejects.toThrow();

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: 'Session expired' }),
      );
    });

    it('rejects with "Session expired" message on 401 from non-auth endpoint', async () => {
      const { onRejected } = getResponseInterceptors();

      await expect(
        onRejected(makeError(401, '/transfers')),
      ).rejects.toThrow('Session expired');
    });

    it('does NOT call signOut on 401 from /auth/login', async () => {
      const auth = getSupabaseAuthMock();
      const { onRejected } = getResponseInterceptors();

      await expect(
        onRejected(makeError(401, '/auth/login')),
      ).rejects.toThrow();

      expect(auth.signOut).not.toHaveBeenCalled();
    });

    it('does NOT call signOut on 401 from /auth/otp endpoint', async () => {
      const auth = getSupabaseAuthMock();
      const { onRejected } = getResponseInterceptors();

      await expect(
        onRejected(makeError(401, '/auth/otp/verify')),
      ).rejects.toThrow();

      expect(auth.signOut).not.toHaveBeenCalled();
    });

    it('does NOT call signOut on 401 from /auth/forgot-password', async () => {
      const auth = getSupabaseAuthMock();
      const { onRejected } = getResponseInterceptors();

      await expect(
        onRejected(makeError(401, '/auth/forgot-password')),
      ).rejects.toThrow();

      expect(auth.signOut).not.toHaveBeenCalled();
    });

    it('extracts the message from error.response.data.error.message', async () => {
      const { onRejected } = getResponseInterceptors();
      const error = makeError(
        422,
        '/transfers',
        { error: { message: 'Validation failed' } },
      );

      await expect(onRejected(error)).rejects.toThrow('Validation failed');
    });

    it('falls back to error.response.data.message', async () => {
      const { onRejected } = getResponseInterceptors();
      const error = makeError(400, '/transfers', { message: 'Bad request body' });

      await expect(onRejected(error)).rejects.toThrow('Bad request body');
    });

    it('falls back to error.message when response data has no message', async () => {
      const { onRejected } = getResponseInterceptors();
      const error = Object.assign(new Error('Network Error'), {
        response: { status: 503, data: {} },
        config: { url: '/transfers' },
      });

      await expect(onRejected(error)).rejects.toThrow('Network Error');
    });

    it('attaches the HTTP status code to the rejected Error', async () => {
      const { onRejected } = getResponseInterceptors();
      const error = makeError(404, '/transfers', {});

      let caught: (Error & { status?: number }) | null = null;
      try {
        await onRejected(error);
      } catch (e) {
        caught = e as Error & { status?: number };
      }

      expect(caught?.status).toBe(404);
    });
  });
});

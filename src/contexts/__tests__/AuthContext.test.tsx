/**
 * src/contexts/__tests__/AuthContext.test.tsx
 *
 * Tests for AuthProvider and the useAuth hook.
 *
 * Strategy:
 *  - Render a minimal consumer component inside AuthProvider.
 *  - Mock `src/lib/axios.ts` so no real HTTP requests are made.
 *  - Import supabase directly to access the mocked auth object — same
 *    instance AuthContext.tsx uses at runtime.
 *  - Control expo-secure-store via jest.requireMock.
 *  - Use fireEvent.press() for Pressable interactions (not props.onPress)
 *    because NativeWind's css-interop wrapper intercepts the onPress prop.
 */

import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { AuthProvider, useAuth } from '../AuthContext';
import { USER_STORAGE_KEY } from '../../config/constants';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Helper: obtain the supabase auth mock object
// ---------------------------------------------------------------------------
type SupabaseAuthMock = {
  getSession: jest.Mock;
  setSession: jest.Mock;
  signOut: jest.Mock;
  onAuthStateChange: jest.Mock;
};

function getAuthMock(): SupabaseAuthMock {
  return supabase.auth as unknown as SupabaseAuthMock;
}

// ---------------------------------------------------------------------------
// Mock the Axios instance
// ---------------------------------------------------------------------------

const mockApiPost = jest.fn();
jest.mock('../../lib/axios', () => ({
  __esModule: true,
  default: {
    post: (...args: unknown[]) => mockApiPost(...args),
    get: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// ---------------------------------------------------------------------------
// Test consumer component
// ---------------------------------------------------------------------------

function TestConsumer() {
  const ctx = useAuth();
  return (
    <>
      <Text testID="isAuthenticated">{String(ctx.isAuthenticated)}</Text>
      <Text testID="isLoading">{String(ctx.isLoading)}</Text>
      <Text testID="accountType">{ctx.accountType ?? 'null'}</Text>
      <Text testID="userName">{ctx.user?.first_name ?? 'null'}</Text>
      <Pressable testID="btn-logout" onPress={() => ctx.logout()} />
      <Pressable testID="btn-login" onPress={() => ctx.login('test@test.com', 'pass')} />
      <Pressable testID="btn-otp-request" onPress={() => ctx.requestOtp('+584121234567')} />
      <Pressable testID="btn-otp-verify" onPress={() => ctx.loginWithOtp('+584121234567', '123456')} />
    </>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockStaffUser = {
  id: 'user-1',
  email: 'admin@test.com',
  first_name: 'Ana',
  last_name: 'Lopez',
  phone: null,
  role_id: null,
  store_id: null,
  store: null,
  is_active: true,
  role: null,
};

const mockLoginResponse = {
  access_token: 'at-123',
  refresh_token: 'rt-456',
  expires_in: 3600,
  account_type: 'STAFF',
  staff: mockStaffUser,
  client: null,
  user: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- session restore on mount ----

  describe('session restore on mount', () => {
    it('isLoading is true before the session check resolves', () => {
      getAuthMock().getSession.mockReturnValue(new Promise(() => {}));

      renderWithProvider();

      expect(screen.getByTestId('isLoading').props.children).toBe('true');
    });

    it('isLoading becomes false after the session check resolves', async () => {
      getAuthMock().getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );
    });

    it('isAuthenticated is false when no session exists', async () => {
      getAuthMock().getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('false'),
      );
    });

    it('restores user from SecureStore when a valid session token exists', async () => {
      getAuthMock().getSession.mockResolvedValue({
        data: { session: { access_token: 'existing', refresh_token: 'rt' } },
        error: null,
      });

      const ssm = jest.requireMock('expo-secure-store') as { getItemAsync: jest.Mock };
      ssm.getItemAsync.mockImplementation((key: string) => {
        if (key === USER_STORAGE_KEY) return Promise.resolve(JSON.stringify(mockStaffUser));
        if (key === `${USER_STORAGE_KEY}_type`) return Promise.resolve('STAFF');
        return Promise.resolve(null);
      });

      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('true'),
      );
      expect(screen.getByTestId('userName').props.children).toBe('Ana');
      expect(screen.getByTestId('accountType').props.children).toBe('STAFF');
    });

    it('calls signOut and clears state when no session exists', async () => {
      getAuthMock().getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      expect(getAuthMock().signOut).toHaveBeenCalledTimes(1);
    });
  });

  // ---- login ----

  describe('login()', () => {
    beforeEach(() => {
      getAuthMock().getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      getAuthMock().setSession.mockResolvedValue({
        data: { session: {} },
        error: null,
      });
      mockApiPost.mockResolvedValue({ data: mockLoginResponse });
    });

    it('calls POST /auth/login with email and password', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-login'));
      });

      expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'pass',
      });
    });

    it('calls supabase.auth.setSession with the returned tokens', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-login'));
      });

      expect(getAuthMock().setSession).toHaveBeenCalledWith({
        access_token: 'at-123',
        refresh_token: 'rt-456',
      });
    });

    it('persists the user to SecureStore after login', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-login'));
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        USER_STORAGE_KEY,
        expect.stringContaining('Ana'),
      );
    });

    it('sets isAuthenticated to true after successful login', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-login'));
      });

      await waitFor(() =>
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('true'),
      );
    });

    it('sets accountType from the login response', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-login'));
      });

      await waitFor(() =>
        expect(screen.getByTestId('accountType').props.children).toBe('STAFF'),
      );
    });
  });

  // ---- logout ----

  describe('logout()', () => {
    beforeEach(() => {
      getAuthMock().getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
    });

    it('calls supabase.auth.signOut', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );
      // signOut was already called once during mount (no-session path); reset counter
      getAuthMock().signOut.mockClear();

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-logout'));
      });

      expect(getAuthMock().signOut).toHaveBeenCalledTimes(1);
    });

    it('deletes the user key from SecureStore', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-logout'));
      });

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(USER_STORAGE_KEY);
    });

    it('sets isAuthenticated to false after logout', async () => {
      // Seed a logged-in state first
      getAuthMock().getSession.mockResolvedValueOnce({
        data: { session: { access_token: 'tok', refresh_token: 'rt' } },
        error: null,
      });
      const ssm = jest.requireMock('expo-secure-store') as { getItemAsync: jest.Mock };
      ssm.getItemAsync.mockImplementation((key: string) => {
        if (key === USER_STORAGE_KEY) return Promise.resolve(JSON.stringify(mockStaffUser));
        if (key === `${USER_STORAGE_KEY}_type`) return Promise.resolve('STAFF');
        return Promise.resolve(null);
      });

      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('true'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-logout'));
      });

      await waitFor(() =>
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('false'),
      );
    });

    it('redirects to /(auth)/login after logout', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-logout'));
      });

      expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  // ---- requestOtp ----

  describe('requestOtp()', () => {
    it('calls POST /auth/otp/request with the phone number', async () => {
      getAuthMock().getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      mockApiPost.mockResolvedValue({ data: {} });

      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-otp-request'));
      });

      expect(mockApiPost).toHaveBeenCalledWith('/auth/otp/request', {
        phone: '+584121234567',
      });
    });
  });

  // ---- loginWithOtp ----

  describe('loginWithOtp()', () => {
    beforeEach(() => {
      getAuthMock().getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      getAuthMock().setSession.mockResolvedValue({
        data: { session: {} },
        error: null,
      });
      mockApiPost.mockResolvedValue({
        data: { ...mockLoginResponse, user: mockStaffUser },
      });
    });

    it('calls POST /auth/otp/verify with phone and code', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-otp-verify'));
      });

      expect(mockApiPost).toHaveBeenCalledWith('/auth/otp/verify', {
        phone: '+584121234567',
        code: '123456',
      });
    });

    it('sets the session after successful OTP verification', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-otp-verify'));
      });

      expect(getAuthMock().setSession).toHaveBeenCalledWith({
        access_token: 'at-123',
        refresh_token: 'rt-456',
      });
    });

    it('sets isAuthenticated to true after OTP login', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').props.children).toBe('false'),
      );

      await act(async () => {
        fireEvent.press(screen.getByTestId('btn-otp-verify'));
      });

      await waitFor(() =>
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('true'),
      );
    });
  });
});

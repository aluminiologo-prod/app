import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';
import api from '../lib/axios';
import type { AuthUser, AccountType } from '../types/auth';
import { USER_STORAGE_KEY } from '../config/constants';

export interface LoginResponsePayload {
  access_token: string;
  refresh_token: string;
  account_type: AccountType;
  staff?: AuthUser | null;
  user?: AuthUser | null;
  client?: unknown | null;
}

interface AuthContextType {
  user: AuthUser | null;
  accountType: AccountType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  loginWithOtp: (phone: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  /** Persist a LoginResponse coming from the public registration flow. */
  applyLoginResponse: (data: LoginResponsePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
          const storedType = await SecureStore.getItemAsync(`${USER_STORAGE_KEY}_type`);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setAccountType((storedType as AccountType) ?? 'STAFF');
          }
        } else {
          // Clear any stale data
          await supabase.auth.signOut();
          await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
          await SecureStore.deleteItemAsync(`${USER_STORAGE_KEY}_type`);
          setUser(null);
          setAccountType(null);
        }
      } catch {
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setAccountType(null);
        SecureStore.deleteItemAsync(USER_STORAGE_KEY);
        SecureStore.deleteItemAsync(`${USER_STORAGE_KEY}_type`);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const _persistSession = useCallback(async (data: {
    access_token: string;
    refresh_token: string;
    account_type: AccountType;
    staff: AuthUser | null;
    user: AuthUser | null;
    client: unknown | null;
  }) => {
    await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    const userData: AuthUser | null = data.user ?? data.staff ?? null;
    if (!userData) throw new Error('No staff account linked to this profile');

    const userWithRole: AuthUser = { ...userData, role: userData.role ?? null };
    setUser(userWithRole);
    setAccountType(data.account_type);

    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(userWithRole));
    await SecureStore.setItemAsync(`${USER_STORAGE_KEY}_type`, data.account_type);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    await _persistSession(data);
  }, [_persistSession]);

  const requestOtp = useCallback(async (phone: string) => {
    await api.post('/auth/otp/request', { phone });
  }, []);

  const loginWithOtp = useCallback(async (phone: string, code: string) => {
    const { data } = await api.post('/auth/otp/verify', { phone, code });
    const userData = data.user ?? data.staff ?? data.client ?? null;
    await _persistSession({ ...data, user: userData, staff: userData });
  }, [_persistSession]);

  const applyLoginResponse = useCallback(async (data: LoginResponsePayload) => {
    const userData = (data.user ?? data.staff ?? (data.client as AuthUser | null)) ?? null;
    await _persistSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      account_type: data.account_type,
      staff: userData,
      user: userData,
      client: data.client ?? null,
    });
  }, [_persistSession]);

  const forgotPassword = useCallback(async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccountType(null);
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    await SecureStore.deleteItemAsync(`${USER_STORAGE_KEY}_type`);
    router.replace('/(auth)/login-otp');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accountType,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        requestOtp,
        loginWithOtp,
        forgotPassword,
        applyLoginResponse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

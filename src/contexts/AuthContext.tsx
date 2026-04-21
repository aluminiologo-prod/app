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
import {
  clearFlowChoice,
  getFlowChoice,
  setFlowChoice,
  type FlowChoice,
} from '../lib/flowChoice';

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
  flowChoice: FlowChoice | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  loginWithOtp: (phone: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  /** Persist a LoginResponse coming from the public registration flow. */
  applyLoginResponse: (data: LoginResponsePayload) => Promise<void>;
  /** Records the BOTH-user's pick and navigates accordingly. */
  chooseFlow: (flow: FlowChoice) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [flowChoice, setFlowChoiceState] = useState<FlowChoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
          const storedType = await SecureStore.getItemAsync(`${USER_STORAGE_KEY}_type`);
          const storedFlow = await getFlowChoice();
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setAccountType((storedType as AccountType) ?? 'STAFF');
            setFlowChoiceState(storedFlow);
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
        setFlowChoiceState(null);
        SecureStore.deleteItemAsync(USER_STORAGE_KEY);
        SecureStore.deleteItemAsync(`${USER_STORAGE_KEY}_type`);
        clearFlowChoice();
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
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    if (sessionError) throw sessionError;

    // For CLIENT-only accounts the backend doesn't return a staff/user object
    // — fall back to the `client` payload so we still have something to render
    // as `user.first_name` in the UI. Typed as unknown on the API boundary.
    const clientUser = data.client as
      | { id: string; first_name?: string; last_name?: string; email?: string; phone?: string | null }
      | null
      | undefined;
    const userData: AuthUser | null =
      data.user ??
      data.staff ??
      (clientUser
        ? {
            id: clientUser.id,
            email: clientUser.email ?? '',
            first_name: clientUser.first_name ?? '',
            last_name: clientUser.last_name ?? '',
            phone: clientUser.phone ?? null,
            role_id: null,
            store_id: null,
            store: null,
            is_active: true,
            role: null,
          }
        : null);
    if (!userData) throw new Error('No account linked to this profile');

    const userWithRole: AuthUser = { ...userData, role: userData.role ?? null };
    setUser(userWithRole);
    setAccountType(data.account_type);

    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(userWithRole));
    await SecureStore.setItemAsync(`${USER_STORAGE_KEY}_type`, data.account_type);

    // Accounts with a single role land directly on the right screen. BOTH
    // accounts keep `flowChoice` null until the user picks from the modal
    // the first time; subsequent logins remember the choice.
    if (data.account_type === 'CLIENT') {
      await setFlowChoice('client');
      setFlowChoiceState('client');
    } else if (data.account_type === 'STAFF') {
      await setFlowChoice('admin');
      setFlowChoiceState('admin');
    } else {
      const existing = await getFlowChoice();
      setFlowChoiceState(existing);
    }
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
    setFlowChoiceState(null);
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    await SecureStore.deleteItemAsync(`${USER_STORAGE_KEY}_type`);
    await clearFlowChoice();
    router.replace('/(auth)/login-otp');
  }, []);

  const chooseFlow = useCallback(async (flow: FlowChoice) => {
    // Reject choices incompatible with the current account type so a CLIENT
    // account can't land in the admin shell (or vice-versa) via a deep link.
    if (!accountType) return;
    if (accountType === 'CLIENT' && flow !== 'client') return;
    if (accountType === 'STAFF' && flow !== 'admin') return;

    await setFlowChoice(flow);
    setFlowChoiceState(flow);
    if (flow === 'client') {
      router.replace('/(client)/(tabs)/home');
    } else {
      router.replace('/(app)/(tabs)/in-transit');
    }
  }, [accountType]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accountType,
        flowChoice,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        requestOtp,
        loginWithOtp,
        forgotPassword,
        applyLoginResponse,
        chooseFlow,
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

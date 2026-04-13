import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase requires a storage adapter that is synchronous at the type level
// but expo-secure-store is async. We use the async API via a compatible adapter.
const SecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

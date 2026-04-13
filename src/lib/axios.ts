import axios from 'axios';
import { supabase } from './supabase';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Request interceptor: attach Supabase Bearer token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor: unwrap data.data, handle 401
api.interceptors.response.use(
  (response) => {
    if (response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const requestUrl: string = error.config?.url ?? '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/otp') ||
        requestUrl.includes('/auth/forgot-password');

      if (!isAuthEndpoint) {
        Toast.show({ type: 'error', text1: 'Session expired', text2: 'Please log in again.' });
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
        return Promise.reject(new Error('Session expired'));
      }
    }

    const message: string =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred';

    const apiError = new Error(message);
    (apiError as Error & { status?: number }).status = error.response?.status;
    return Promise.reject(apiError);
  },
);

export default api;

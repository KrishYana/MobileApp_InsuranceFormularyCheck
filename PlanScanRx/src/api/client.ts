import axios from 'axios';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';
import { NetworkError, AuthError, APIError } from '../errors/AppError';
import { errorLogger } from '../errors/errorLogger';

const DEV_API_HOST = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
});

const BASE_URL = __DEV__
  ? `${DEV_API_HOST}/v1`
  : 'https://api.planscanrx.com/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject Supabase JWT
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    config.headers['X-Guest-Mode'] = 'true';
  }
  return config;
});

// Response interceptor: normalize errors into AppError hierarchy
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error (no response received)
      const netError = new NetworkError();
      errorLogger.log(netError);
      return Promise.reject(netError);
    }

    const { status, data } = error.response;

    if (status === 401) {
      const authError = new AuthError(status, data?.message);
      errorLogger.log(authError);
      return Promise.reject(authError);
    }

    const apiError = new APIError(status, data?.message ?? error.message);
    errorLogger.log(apiError);
    return Promise.reject(apiError);
  },
);

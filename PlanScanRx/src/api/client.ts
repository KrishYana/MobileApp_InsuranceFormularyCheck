import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkError, AuthError, APIError } from '../errors/AppError';
import { errorLogger } from '../errors/errorLogger';

// TODO: Replace with real backend URL
const BASE_URL = 'https://api.planscanrx.com/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@planscanrx/auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser, USState } from '../types/auth';

const KEYS = {
  AUTH_USER: '@planscanrx/auth_user',
  AUTH_MODE: '@planscanrx/auth_mode',
  SELECTED_STATE: '@planscanrx/selected_state',
} as const;

// Auth persistence

export async function saveAuthUser(user: AuthUser): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.AUTH_USER, JSON.stringify(user)],
    [KEYS.AUTH_MODE, 'authenticated'],
  ]);
}

export async function saveGuestMode(): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.AUTH_USER, ''],
    [KEYS.AUTH_MODE, 'guest'],
  ]);
}

export async function getStoredAuth(): Promise<{
  mode: 'authenticated' | 'guest' | null;
  user: AuthUser | null;
}> {
  const [[, userJson], [, mode]] = await AsyncStorage.multiGet([
    KEYS.AUTH_USER,
    KEYS.AUTH_MODE,
  ]);

  if (mode === 'authenticated' && userJson) {
    return { mode: 'authenticated', user: JSON.parse(userJson) };
  }
  if (mode === 'guest') {
    return { mode: 'guest', user: null };
  }
  return { mode: null, user: null };
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.AUTH_USER, KEYS.AUTH_MODE]);
}

// State selector persistence

export async function saveSelectedState(state: USState): Promise<void> {
  await AsyncStorage.setItem(KEYS.SELECTED_STATE, JSON.stringify(state));
}

export async function getSelectedState(): Promise<USState | null> {
  const json = await AsyncStorage.getItem(KEYS.SELECTED_STATE);
  return json ? JSON.parse(json) : null;
}

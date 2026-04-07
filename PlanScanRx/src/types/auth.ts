export type AuthProvider = 'apple' | 'google';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  provider: AuthProvider;
  photoUrl?: string;
};

export type AuthMode = 'authenticated' | 'guest' | null;

export type AuthState = {
  mode: AuthMode;
  user: AuthUser | null;
  isLoading: boolean;
};

export type USState = {
  code: string;
  name: string;
};

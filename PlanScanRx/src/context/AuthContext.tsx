import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthState, AuthUser } from '../types/auth';
import {
  signInWithGoogle as googleSignIn,
  signInWithApple as appleSignIn,
  signOutGoogle,
} from '../services/auth';
import {
  saveAuthUser,
  saveGuestMode,
  getStoredAuth,
  clearAuth,
} from '../services/storage';

type AuthContextValue = AuthState & {
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  isGuest: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    mode: null,
    user: null,
    isLoading: true,
  });

  // Restore auth state from storage on mount
  useEffect(() => {
    getStoredAuth().then(({ mode, user }) => {
      setState({ mode, user, isLoading: false });
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const user = await googleSignIn();
    await saveAuthUser(user);
    setState({ mode: 'authenticated', user, isLoading: false });
  }, []);

  const signInWithApple = useCallback(async () => {
    const user = await appleSignIn();
    await saveAuthUser(user);
    setState({ mode: 'authenticated', user, isLoading: false });
  }, []);

  const continueAsGuest = useCallback(async () => {
    await saveGuestMode();
    setState({ mode: 'guest', user: null, isLoading: false });
  }, []);

  const signOut = useCallback(async () => {
    await signOutGoogle();
    await clearAuth();
    setState({ mode: null, user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signInWithApple,
        continueAsGuest,
        signOut,
        isGuest: state.mode === 'guest',
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

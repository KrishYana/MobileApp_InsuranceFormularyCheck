import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { AuthState, AuthUser } from '../types/auth';
import { supabase } from '../services/supabase';
import {
  signInWithGoogle as googleSignIn,
  signInWithApple as appleSignIn,
  signOutAll,
} from '../services/auth';
import {
  saveAuthUser,
  saveGuestMode,
  getStoredAuth,
  clearAuth,
} from '../services/storage';
import { apiClient } from '../api/client';

type AuthContextValue = AuthState & {
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  isGuest: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, string>;
  app_metadata?: Record<string, string>;
}): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    displayName:
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
    provider:
      user.app_metadata?.provider === 'apple' ? 'apple' : 'google',
    photoUrl:
      user.user_metadata?.avatar_url ?? user.user_metadata?.picture,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    mode: null,
    user: null,
    isLoading: true,
  });

  // Restore auth state on mount
  useEffect(() => {
    async function restore() {
      // Check for existing Supabase session first
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user = mapSupabaseUser(session.user);
        await saveAuthUser(user);
        setState({ mode: 'authenticated', user, isLoading: false });
        return;
      }

      // Fall back to guest mode check
      const { mode } = await getStoredAuth();
      if (mode === 'guest') {
        setState({ mode: 'guest', user: null, isLoading: false });
        return;
      }

      setState({ mode: null, user: null, isLoading: false });
    }
    restore();
  }, []);

  // Listen for Supabase auth state changes (token refresh, sign out)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = mapSupabaseUser(session.user);
        await saveAuthUser(user);
        setState({ mode: 'authenticated', user, isLoading: false });
      } else if (event === 'SIGNED_OUT') {
        await clearAuth();
        setState({ mode: null, user: null, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncPhysicianRecord = useCallback(async (user: AuthUser) => {
    try {
      await apiClient.post('/auth/callback', {
        displayName: user.displayName,
        email: user.email,
      });
    } catch {
      // Non-blocking — middleware auto-creates physician on next request
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const user = await googleSignIn();
    await saveAuthUser(user);
    setState({ mode: 'authenticated', user, isLoading: false });
    syncPhysicianRecord(user);
  }, [syncPhysicianRecord]);

  const signInWithApple = useCallback(async () => {
    const user = await appleSignIn();
    await saveAuthUser(user);
    setState({ mode: 'authenticated', user, isLoading: false });
    syncPhysicianRecord(user);
  }, [syncPhysicianRecord]);

  const continueAsGuest = useCallback(async () => {
    await saveGuestMode();
    setState({ mode: 'guest', user: null, isLoading: false });
  }, []);

  const signOut = useCallback(async () => {
    await signOutAll();
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

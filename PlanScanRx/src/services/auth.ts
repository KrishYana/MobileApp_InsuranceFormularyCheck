import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { supabase } from './supabase';
import type { AuthUser } from '../types/auth';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId:
      '86543763646-pbuvrr545seg1s884o1068cjfokg5je5.apps.googleusercontent.com',
    iosClientId:
      '86543763646-8pcl85696ligc5g05mda8mj9vfmnm3ca.apps.googleusercontent.com',
    offlineAccess: false,
  });
}

export async function signInWithGoogle(): Promise<AuthUser> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  const idToken = response.data?.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In failed: no ID token received');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) {
    throw new Error(`Supabase auth failed: ${error.message}`);
  }

  const user = data.user;
  return {
    id: user.id,
    email: user.email ?? '',
    displayName:
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
    provider: 'google',
    photoUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture,
  };
}

export async function signInWithApple(): Promise<AuthUser> {
  const appleAuthResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  const credentialState = await appleAuth.getCredentialStateForUser(
    appleAuthResponse.user,
  );

  if (credentialState !== appleAuth.State.AUTHORIZED) {
    throw new Error('Apple Sign-In failed: not authorized');
  }

  const identityToken = appleAuthResponse.identityToken;
  if (!identityToken) {
    throw new Error('Apple Sign-In failed: no identity token');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
  });

  if (error) {
    throw new Error(`Supabase auth failed: ${error.message}`);
  }

  const user = data.user;
  const fullName = appleAuthResponse.fullName;
  const displayName =
    fullName?.givenName && fullName?.familyName
      ? `${fullName.givenName} ${fullName.familyName}`
      : user.user_metadata?.full_name ?? 'PlanScanRx User';

  return {
    id: user.id,
    email: user.email ?? appleAuthResponse.email ?? '',
    displayName,
    provider: 'apple',
  };
}

export async function signOutAll(): Promise<void> {
  await supabase.auth.signOut();
  try {
    await GoogleSignin.signOut();
  } catch {
    // Silent fail — user may not have been signed in with Google
  }
}

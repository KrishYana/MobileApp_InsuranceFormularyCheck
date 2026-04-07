import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import type { AuthUser } from '../types/auth';

// Configure Google Sign-In (call once at app startup)
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    // TODO: Replace with actual web client ID from Google Cloud Console
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    offlineAccess: false,
  });
}

export async function signInWithGoogle(): Promise<AuthUser> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (!response.data?.user) {
    throw new Error('Google Sign-In failed: no user data');
  }

  const { id, email, name, photo } = response.data.user;

  return {
    id,
    email: email ?? '',
    displayName: name ?? '',
    provider: 'google',
    photoUrl: photo ?? undefined,
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

  const fullName = appleAuthResponse.fullName;
  const displayName =
    fullName?.givenName && fullName?.familyName
      ? `${fullName.givenName} ${fullName.familyName}`
      : 'PlanScanRx User';

  return {
    id: appleAuthResponse.user,
    email: appleAuthResponse.email ?? '',
    displayName,
    provider: 'apple',
  };
}

export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Silent fail — user may not have been signed in with Google
  }
}

import React, { useState } from 'react';
import { View, Text, Image, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeProvider';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { Radius } from '../theme/radius';
import { Button, NeuSurface } from '../components/primitives';

// Auth state change in context triggers RootNavigator to swap to MainTabs.
// No manual navigation.replace('Home') needed.

export default function AuthLandingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { signInWithGoogle, signInWithApple, continueAsGuest } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<'apple' | 'google' | null>(null);

  const handleAppleSignIn = async () => {
    try {
      setIsLoading('apple');
      await signInWithApple();
    } catch (error: any) {
      if (error?.code !== '1001') {
        showToast({ message: 'Unable to sign in with Apple. Try again.', variant: 'error' });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading('google');
      await signInWithGoogle();
    } catch (error: any) {
      if (error?.code !== 'SIGN_IN_CANCELLED') {
        showToast({ message: 'Unable to sign in with Google. Try again.', variant: 'error' });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleGuestContinue = async () => {
    await continueAsGuest();
  };

  const disabled = isLoading !== null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingTop: insets.top + Spacing.huge,
      }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      <NeuSurface level="extruded" cornerRadius={Radius.container}>
        <View style={{ padding: Spacing.xl, backgroundColor: theme.surface, borderRadius: Radius.container }}>
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 160, height: 110 }}
            resizeMode="contain"
          />
        </View>
      </NeuSurface>

      <Text
        style={{
          ...Typography.title2,
          color: theme.textPrimary,
          textAlign: 'center',
          marginTop: Spacing.xxxl,
          marginBottom: Spacing.huge,
        }}>
        Formulary coverage, instantly.
      </Text>

      <View style={{ width: '100%', alignItems: 'center', gap: Spacing.lg }}>
        {Platform.OS === 'ios' && (
          <View style={{ width: '85%' }}>
            <Button
              variant="primary"
              size="lg"
              label=" Sign in with Apple"
              onPress={handleAppleSignIn}
              loading={isLoading === 'apple'}
              disabled={disabled}
              fullWidth
            />
          </View>
        )}

        <View style={{ width: '85%' }}>
          <Button
            variant="secondary"
            size="lg"
            label="G  Continue with Google"
            onPress={handleGoogleSignIn}
            loading={isLoading === 'google'}
            disabled={disabled}
            fullWidth
          />
        </View>
      </View>

      <View style={{ marginTop: Spacing.xxxl }}>
        <Button
          variant="tertiary"
          size="md"
          label="Continue as Guest →"
          onPress={handleGuestContinue}
          disabled={disabled}
        />
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + Spacing.lg,
          left: Spacing.xxl,
          right: Spacing.xxl,
          alignItems: 'center',
        }}>
        <Text style={{ ...Typography.caption, color: theme.textSecondary, textAlign: 'center' }}>
          By continuing you agree to our{' '}
          <Text style={{ color: theme.textAccent, textDecorationLine: 'underline' }}>
            Terms of Service
          </Text>
          {' & '}
          <Text style={{ color: theme.textAccent, textDecorationLine: 'underline' }}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}

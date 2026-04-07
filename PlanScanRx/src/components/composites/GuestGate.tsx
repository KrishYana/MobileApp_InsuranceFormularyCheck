import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { TouchTarget } from '../../theme/touchTarget';
import { Button, NeuSurface, NeuIconWell } from '../primitives';

type GuestGateProps = {
  feature: string;
  children: React.ReactNode;
};

export function GuestGate({ feature, children }: GuestGateProps) {
  const { isGuest, signInWithGoogle, signInWithApple } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState<'apple' | 'google' | null>(null);
  const insets = useSafeAreaInsets();

  if (!isGuest) return <>{children}</>;

  const handleSignIn = async (method: 'apple' | 'google') => {
    try {
      setIsLoading(method);
      if (method === 'apple') await signInWithApple();
      else await signInWithGoogle();
      setShowPrompt(false);
    } catch (error: any) {
      showToast({ message: 'Sign in failed. Try again.', variant: 'error' });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      <Pressable
        onPress={() => setShowPrompt(true)}
        style={{ position: 'relative' }}
        accessibilityLabel={`Sign in to ${feature}`}
        accessibilityHint="This feature requires an account">
        <View style={{ opacity: 0.4 }} pointerEvents="none">
          {children}
        </View>
        <NeuSurface level="extrudedSmall" cornerRadius={Radius.full} style={{
          position: 'absolute',
          top: -4,
          right: -4,
        }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: theme.surface,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: 12 }}>🔒</Text>
          </View>
        </NeuSurface>
      </Pressable>

      <Modal
        visible={showPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrompt(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: Radius.container,
              borderTopRightRadius: Radius.container,
              paddingTop: Spacing.xxxl,
              paddingHorizontal: Spacing.xxl,
              paddingBottom: insets.bottom + Spacing.xl,
              alignItems: 'center',
            }}>
            <NeuIconWell icon="🔐" size={56} />

            <Text
              style={{
                ...Typography.title2,
                color: theme.textPrimary,
                marginTop: Spacing.xl,
                marginBottom: Spacing.sm,
              }}>
              Sign in to {feature}
            </Text>

            <Text
              style={{
                ...Typography.body,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: Spacing.xxxl,
              }}>
              Create an account to save lookups, track history, and get coverage change alerts.
            </Text>

            {isLoading ? (
              <ActivityIndicator size="large" color={theme.accent} style={{ marginVertical: Spacing.xl }} />
            ) : (
              <View style={{ width: '100%', alignItems: 'center', gap: Spacing.lg }}>
                {Platform.OS === 'ios' && (
                  <View style={{ width: '85%' }}>
                    <Button
                      variant="primary"
                      size="lg"
                      label=" Sign in with Apple"
                      onPress={() => handleSignIn('apple')}
                      fullWidth
                    />
                  </View>
                )}
                <View style={{ width: '85%' }}>
                  <Button
                    variant="secondary"
                    size="lg"
                    label="G  Continue with Google"
                    onPress={() => handleSignIn('google')}
                    fullWidth
                  />
                </View>
              </View>
            )}

            <View style={{ marginTop: Spacing.xl }}>
              <Button
                variant="tertiary"
                size="md"
                label="Not now"
                onPress={() => setShowPrompt(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

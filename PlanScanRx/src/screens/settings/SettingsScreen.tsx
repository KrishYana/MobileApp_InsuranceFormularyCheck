import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuSurface, NeuInset, Button } from '../../components/primitives';
import { SettingsRow } from '../../components/composites/SettingsRow';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

type ThemeMode = 'light' | 'dark' | 'system';

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

function Separator({ color }: { color: string }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: color,
        opacity: 0.15,
        marginHorizontal: Spacing.lg,
      }}
    />
  );
}

function ThemeSelector() {
  const { theme, mode, setMode } = useTheme();

  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
      <Text
        style={{
          ...Typography.bodyMedium,
          color: theme.textPrimary,
          marginBottom: Spacing.md,
        }}>
        Appearance
      </Text>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {themeOptions.map((opt) => {
          const selected = opt.value === mode;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setMode(opt.value)}
              style={{ flex: 1 }}>
              {selected ? (
                <NeuInset level="insetSmall" cornerRadius={Radius.base}>
                  <View
                    style={{
                      paddingVertical: Spacing.md,
                      alignItems: 'center',
                      borderRadius: Radius.base,
                    }}>
                    <Text
                      style={{
                        ...Typography.label,
                        color: theme.accent,
                      }}>
                      {opt.label}
                    </Text>
                  </View>
                </NeuInset>
              ) : (
                <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
                  <View
                    style={{
                      paddingVertical: Spacing.md,
                      alignItems: 'center',
                      borderRadius: Radius.base,
                      backgroundColor: theme.surface,
                    }}>
                    <Text
                      style={{
                        ...Typography.label,
                        color: theme.textSecondary,
                      }}>
                      {opt.label}
                    </Text>
                  </View>
                </NeuSurface>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, isGuest, signOut } = useAuth();
  const { showToast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      showToast({ message: 'Failed to sign out', variant: 'error' });
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            showToast({
              message: 'Account deletion coming soon',
              variant: 'info',
            }),
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.md,
        }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
          Settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}>
        {/* Section 1: Account (auth users only) */}
        {!isGuest && user && (
          <View style={{ marginBottom: Spacing.xxl }}>
            <NeuSurface level="extruded" cornerRadius={Radius.container}>
              <View style={{ paddingVertical: Spacing.sm }}>
                <SettingsRow
                  icon="person"
                  label={user.displayName || 'Profile'}
                  description={user.email}
                  onPress={() => navigation.navigate('Profile')}
                />
              </View>
            </NeuSurface>
          </View>
        )}

        {/* Section 2: Preferences */}
        <NeuSurface level="extruded" cornerRadius={Radius.container}>
          <View style={{ paddingVertical: Spacing.sm }}>
            <ThemeSelector />
            <Separator color={theme.shadowDark} />
            <SettingsRow
              icon="notification"
              label="Notifications"
              description="Push alerts & reminders"
              onPress={() => navigation.navigate('Notifications')}
            />
            <Separator color={theme.shadowDark} />
            <SettingsRow
              icon="save"
              label="Data & Storage"
              description="History & saved lookups retention"
              onPress={() => navigation.navigate('DataRetention')}
            />
          </View>
        </NeuSurface>

        {/* Section 3: About */}
        <View style={{ marginTop: Spacing.xxl }}>
          <NeuSurface level="extruded" cornerRadius={Radius.container}>
            <View style={{ paddingVertical: Spacing.sm }}>
              <SettingsRow
                icon="info"
                label="About & Legal"
                description="Version, terms, privacy"
                onPress={() => navigation.navigate('AboutLegal')}
              />
            </View>
          </NeuSurface>
          <Text
            style={{
              ...Typography.caption,
              color: theme.textSecondary,
              textAlign: 'center',
              marginTop: Spacing.sm,
            }}>
            Version 0.1.0
          </Text>
        </View>

        {/* Section 4: Actions */}
        <View style={{ marginTop: Spacing.xxl, gap: Spacing.md }}>
          {!isGuest ? (
            <>
              <Button
                variant="secondary"
                label="Sign Out"
                onPress={handleSignOut}
              />
              <Button
                variant="destructive"
                label="Delete Account"
                onPress={handleDeleteAccount}
              />
            </>
          ) : (
            <Button
              variant="primary"
              label="Sign In"
              onPress={handleSignOut}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

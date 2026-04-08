import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuSurface, NeuIconWell, Button } from '../../components/primitives';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Profile'>;

function InfoRow({
  label,
  value,
  borderColor,
}: {
  label: string;
  value: string;
  borderColor: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
      }}>
      <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
        {label}
      </Text>
      <Text
        style={{
          ...Typography.body,
          color: theme.textPrimary,
          marginTop: Spacing.xs,
        }}>
        {value}
      </Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, isGuest } = useAuth();
  const { showToast } = useToast();

  if (isGuest || !user) {
    navigation.goBack();
    return null;
  }

  const borderColor = `${theme.shadowDark}26`; // 15% opacity

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
        }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ ...Typography.body, color: theme.accent }}>
            {'\u2039'} Settings
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xxl,
          alignItems: 'center',
        }}>
        {/* Avatar */}
        <View style={{ marginVertical: Spacing.xxl }}>
          {user.photoUrl ? (
            <Image
              source={{ uri: user.photoUrl }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
              }}
            />
          ) : (
            <NeuIconWell size={80}>
              <Text style={{ fontSize: 36 }}>{'\uD83D\uDC64'}</Text>
            </NeuIconWell>
          )}
        </View>

        {/* Info Card */}
        <View style={{ width: '100%' }}>
          <NeuSurface level="extruded" cornerRadius={Radius.container}>
            <View style={{ paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg }}>
              <InfoRow
                label="Display Name"
                value={user.displayName || 'Not set'}
                borderColor={borderColor}
              />
              <InfoRow
                label="Email"
                value={user.email || 'Not provided'}
                borderColor={borderColor}
              />
              <View style={{ paddingVertical: Spacing.md }}>
                <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
                  Signed in with
                </Text>
                <Text
                  style={{
                    ...Typography.body,
                    color: theme.textPrimary,
                    marginTop: Spacing.xs,
                  }}>
                  {user.provider === 'apple' ? 'Apple' : 'Google'}
                </Text>
              </View>
            </View>
          </NeuSurface>
        </View>

        {/* Edit Button */}
        <View style={{ width: '100%', marginTop: Spacing.xxl }}>
          <Button
            variant="tertiary"
            label="Edit Profile"
            onPress={() =>
              showToast({ message: 'Profile editing coming soon', variant: 'info' })
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

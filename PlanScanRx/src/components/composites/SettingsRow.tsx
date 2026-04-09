import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { TouchTarget } from '../../theme/touchTarget';
import { NeuIconWell } from '../primitives';

type SettingsRowProps = {
  icon: string;
  label: string;
  description?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
  disabled?: boolean;
};

export function SettingsRow({
  icon,
  label,
  description,
  onPress,
  showChevron,
  rightContent,
  disabled = false,
}: SettingsRowProps) {
  const { theme } = useTheme();
  const hasChevron = showChevron ?? !!onPress;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: TouchTarget.recommended,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        opacity: pressed ? 0.7 : disabled ? 0.5 : 1,
      })}>
      <NeuIconWell size={40}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </NeuIconWell>

      <View style={{ flex: 1, marginLeft: Spacing.lg }}>
        <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
          {label}
        </Text>
        {description && (
          <Text
            style={{
              ...Typography.caption,
              color: theme.textSecondary,
              marginTop: Spacing.xs,
            }}>
            {description}
          </Text>
        )}
      </View>

      {rightContent}

      {hasChevron && !rightContent && (
        <Text
          style={{
            ...Typography.body,
            color: theme.textSecondary,
            marginLeft: Spacing.sm,
          }}>
          {'\u203A'}
        </Text>
      )}
    </Pressable>
  );
}

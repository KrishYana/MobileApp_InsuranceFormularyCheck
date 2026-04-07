import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { TouchTarget } from '../../theme/touchTarget';
import { NeuInset } from './NeuInset';
import { NeuSurface } from './NeuSurface';

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  description?: string;
};

export function Toggle({
  value,
  onValueChange,
  disabled = false,
  loading = false,
  label,
  description,
}: ToggleProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: TouchTarget.minimum,
        paddingVertical: Spacing.sm,
      }}>
      {(label || description) && (
        <View style={{ flex: 1, marginRight: Spacing.lg }}>
          {label && (
            <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>{label}</Text>
          )}
          {description && (
            <Text
              style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
              {description}
            </Text>
          )}
        </View>
      )}
      {loading ? (
        <ActivityIndicator size="small" color={theme.accent} />
      ) : (
        <Pressable
          onPress={() => !disabled && onValueChange(!value)}
          disabled={disabled}
          accessibilityRole="switch"
          accessibilityState={{ checked: value, disabled }}
          accessibilityLabel={label}
          style={{ opacity: disabled ? 0.5 : 1 }}>
          {/* Track — inset well */}
          <NeuInset level="insetSmall" cornerRadius={Radius.full}>
            <View
              style={{
                width: 52,
                height: 30,
                borderRadius: Radius.full,
                backgroundColor: value ? theme.accent : theme.surface,
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}>
              {/* Thumb — extruded circle */}
              <NeuSurface level="extrudedSmall" cornerRadius={Radius.full}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: theme.surface,
                    transform: [{ translateX: value ? 22 : 0 }],
                  }}
                />
              </NeuSurface>
            </View>
          </NeuInset>
        </Pressable>
      )}
    </View>
  );
}

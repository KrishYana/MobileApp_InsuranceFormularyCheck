import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { NeuIconWell } from './NeuIconWell';
import { Button } from './Button';

type EmptyStateProps = {
  icon?: string;
  headline: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  secondaryCtaLabel?: string;
  onSecondaryCtaPress?: () => void;
};

export function EmptyState({
  icon,
  headline,
  description,
  ctaLabel,
  onCtaPress,
  secondaryCtaLabel,
  onSecondaryCtaPress,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxxl,
        paddingVertical: Spacing.huge,
      }}>
      {icon && (
        <View style={{ marginBottom: Spacing.xxl }}>
          <NeuIconWell icon={icon} size={64} />
        </View>
      )}

      <Text
        style={{
          ...Typography.title2,
          color: theme.textPrimary,
          textAlign: 'center',
          marginBottom: Spacing.sm,
        }}>
        {headline}
      </Text>

      {description && (
        <Text
          style={{
            ...Typography.body,
            color: theme.textSecondary,
            textAlign: 'center',
            marginBottom: Spacing.xxl,
          }}>
          {description}
        </Text>
      )}

      {ctaLabel && onCtaPress && (
        <Button variant="primary" size="md" label={ctaLabel} onPress={onCtaPress} />
      )}

      {secondaryCtaLabel && onSecondaryCtaPress && (
        <View style={{ marginTop: Spacing.md }}>
          <Button
            variant="tertiary"
            size="md"
            label={secondaryCtaLabel}
            onPress={onSecondaryCtaPress}
          />
        </View>
      )}
    </View>
  );
}

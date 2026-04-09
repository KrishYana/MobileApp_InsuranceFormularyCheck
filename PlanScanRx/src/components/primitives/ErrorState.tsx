import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuIconWell } from './NeuIconWell';
import { Button } from './Button';

type ErrorStateProps = {
  variant: 'inline' | 'card' | 'fullscreen';
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  variant,
  title,
  description,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  const { theme } = useTheme();

  if (variant === 'inline') {
    return (
      <Text
        style={{ ...Typography.caption, color: theme.error }}
        accessibilityRole="alert">
        {title}
      </Text>
    );
  }

  if (variant === 'card') {
    return (
      <View
        style={{
          backgroundColor: theme.statusNotCoveredBg,
          borderRadius: Radius.base,
          borderLeftWidth: 4,
          borderLeftColor: theme.error,
          padding: Spacing.xl,
          gap: Spacing.sm,
        }}
        accessibilityRole="alert">
        <Text style={{ ...Typography.bodyBold, color: theme.textPrimary }}>{title}</Text>
        {description && (
          <Text style={{ ...Typography.body, color: theme.textSecondary }}>{description}</Text>
        )}
        {onRetry && (
          <View style={{ marginTop: Spacing.sm, alignSelf: 'flex-start' }}>
            <Button variant="secondary" size="sm" label={retryLabel} onPress={onRetry} />
          </View>
        )}
      </View>
    );
  }

  // fullscreen
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxxl,
        backgroundColor: theme.surface,
      }}
      accessibilityRole="alert">
      <View style={{ marginBottom: Spacing.xxl }}>
        <NeuIconWell icon="warning" size={72} iconColor={theme.error} />
      </View>
      <Text
        style={{
          ...Typography.title2,
          color: theme.textPrimary,
          textAlign: 'center',
          marginBottom: Spacing.sm,
        }}>
        {title}
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
      {onRetry && <Button variant="primary" size="lg" label={retryLabel} onPress={onRetry} />}
    </View>
  );
}

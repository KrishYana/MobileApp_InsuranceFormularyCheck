import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuInset } from './NeuInset';
import {
  calculateFreshness,
  freshnessLabel,
  type FreshnessTier,
} from '../../utils/freshnessCalculator';

type FreshnessIndicatorProps = {
  sourceDate: string | Date | null;
  variant?: 'dot' | 'badge' | 'banner';
};

export function FreshnessIndicator({ sourceDate, variant = 'dot' }: FreshnessIndicatorProps) {
  const { theme } = useTheme();

  const { tier, daysSince } = useMemo(() => {
    const t = calculateFreshness(sourceDate);
    let days: number | undefined;
    if (sourceDate) {
      const d = typeof sourceDate === 'string' ? new Date(sourceDate) : sourceDate;
      days = Math.floor((Date.now() - d.getTime()) / 86400000);
    }
    return { tier: t, daysSince: days };
  }, [sourceDate]);

  const color = useMemo(() => {
    const map: Record<FreshnessTier, string> = {
      fresh: theme.freshnessGreen,
      aging: theme.freshnessAmber,
      stale: theme.freshnessRed,
      unknown: theme.freshnessUnknown,
    };
    return map[tier];
  }, [tier, theme]);

  const label = freshnessLabel(tier, daysSince);

  if (variant === 'dot') {
    return (
      <View
        style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }}
        accessibilityLabel={label}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}
        accessibilityLabel={label}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
        <Text style={{ ...Typography.caption, color: theme.textSecondary }}>{label}</Text>
      </View>
    );
  }

  // banner — inset into surface for neumorphic feel
  return (
    <NeuInset level="insetSmall" cornerRadius={Radius.base}>
      <View
        style={{
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xl,
          borderRadius: Radius.base,
          backgroundColor: theme.surface,
        }}
        accessibilityRole="alert"
        accessibilityLabel={label}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
          <Text
            style={{
              ...Typography.label,
              color,
              fontWeight: tier === 'stale' ? '700' : '500',
            }}>
            {label}
          </Text>
        </View>
      </View>
    </NeuInset>
  );
}

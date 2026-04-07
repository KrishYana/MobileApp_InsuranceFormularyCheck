import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuInset } from '../primitives';

type TierDisplayProps = {
  tierLevel: number | null;
  tierName: string | null;
};

export function TierDisplay({ tierLevel, tierName }: TierDisplayProps) {
  const { theme } = useTheme();

  if (!tierLevel) return null;

  const tierColor = tierLevel <= 2 ? theme.tierLow : tierLevel <= 4 ? theme.tierMid : theme.tierHigh;

  return (
    <NeuInset level="insetSmall" cornerRadius={Radius.base}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          padding: Spacing.lg,
          borderRadius: Radius.base,
          backgroundColor: theme.surface,
        }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: tierColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{ ...Typography.title3, color: theme.textInverse, fontWeight: '700' }}>
            {tierLevel}
          </Text>
        </View>
        <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary, flex: 1 }}>
          {tierName ?? `Tier ${tierLevel}`}
        </Text>
      </View>
    </NeuInset>
  );
}

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Animation } from '../../theme/animation';
import { NeuSurface, Badge } from '../primitives';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import type { FormularyEntry } from '../../types/domain';

type ComparisonRowProps = {
  entry: FormularyEntry;
  planName: string;
  onPress: () => void;
};

export function ComparisonRow({ entry, planName, onPress }: ComparisonRowProps) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);

  const statusColor = entry.isCovered ? theme.statusCovered : theme.statusNotCovered;
  const statusLabel = entry.isCovered ? 'COVERED' : 'NOT COVERED';

  const restrictionCount = [entry.priorAuthRequired, entry.stepTherapy, entry.quantityLimit].filter(Boolean).length;

  return (
    <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          padding: Spacing.lg,
          borderRadius: Radius.base,
          backgroundColor: theme.surface,
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
          transform: [{ scale: pressed ? Animation.pressScale.card : 1 }],
        }}
        accessibilityRole="button"
        accessibilityLabel={`${planName}: ${statusLabel}`}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary, flex: 1 }} numberOfLines={1}>
            {planName}
          </Text>
          <Badge
            variant="coverage"
            label={statusLabel}
            color={statusColor}
            backgroundColor={entry.isCovered ? theme.statusCoveredBg : theme.statusNotCoveredBg}
          />
        </View>

        {entry.isCovered && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
              {entry.tierName ?? `Tier ${entry.tierLevel ?? '?'}`}
            </Text>
            <Text style={{ ...Typography.label, color: theme.textPrimary }}>
              {entry.copayAmount != null
                ? formatCurrency(entry.copayAmount)
                : entry.coinsurancePct != null
                  ? formatPercentage(entry.coinsurancePct)
                  : '—'}
            </Text>
          </View>
        )}

        {restrictionCount > 0 && (
          <Text style={{ ...Typography.badge, color: theme.statusPriorAuth, marginTop: Spacing.sm }}>
            {restrictionCount} RESTRICTION{restrictionCount > 1 ? 'S' : ''}
          </Text>
        )}
      </Pressable>
    </NeuSurface>
  );
}

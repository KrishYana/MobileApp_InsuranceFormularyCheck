import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

type CostDisplayProps = {
  copayAmount: number | null;
  coinsurancePct: number | null;
  copayMailOrder: number | null;
};

export function CostDisplay({ copayAmount, coinsurancePct, copayMailOrder }: CostDisplayProps) {
  const { theme } = useTheme();

  const hasCopay = copayAmount != null;
  const hasCoinsurance = coinsurancePct != null;
  const hasMailOrder = copayMailOrder != null;

  if (!hasCopay && !hasCoinsurance) {
    return (
      <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
        Cost sharing details not available. Contact the plan.
      </Text>
    );
  }

  return (
    <View style={{ gap: Spacing.xs }}>
      {hasCopay && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ ...Typography.label, color: theme.textSecondary }}>Est. Copay</Text>
          <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
            {formatCurrency(copayAmount)}
          </Text>
        </View>
      )}
      {hasCoinsurance && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ ...Typography.label, color: theme.textSecondary }}>Est. Coinsurance</Text>
          <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
            {formatPercentage(coinsurancePct)}
          </Text>
        </View>
      )}
      {hasMailOrder && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ ...Typography.label, color: theme.textSecondary }}>Mail Order</Text>
          <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
            {formatCurrency(copayMailOrder)}
          </Text>
        </View>
      )}
    </View>
  );
}

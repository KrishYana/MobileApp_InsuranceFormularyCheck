import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuSurface, Badge, Button } from '../primitives';
import type { Plan } from '../../types/domain';

type PlanConfirmCardProps = {
  plan: Plan;
  onConfirm: () => void;
  loading?: boolean;
};

export function PlanConfirmCard({ plan, onConfirm, loading = false }: PlanConfirmCardProps) {
  const { theme } = useTheme();

  return (
    <NeuSurface level="extruded" cornerRadius={Radius.container}>
      <View
        style={{
          padding: Spacing.xxl,
          borderRadius: Radius.container,
          backgroundColor: theme.surface,
          gap: Spacing.md,
        }}>
        <Text style={{ ...Typography.title3, color: theme.textPrimary }}>
          {plan.planName}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
          {plan.planType && (
            <Badge variant="info" label={plan.planType} />
          )}
          {plan.marketType && (
            <Badge variant="info" label={plan.marketType.replace('_', ' ')} />
          )}
          {plan.metalLevel && (
            <Badge
              variant="info"
              label={plan.metalLevel}
              color={theme.accent}
              backgroundColor={theme.statusStepTherapyBg}
            />
          )}
        </View>

        <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
          Plan Year: {plan.planYear}
        </Text>

        <View style={{ marginTop: Spacing.sm }}>
          <Button
            variant="primary"
            size="md"
            label="Confirm Plan"
            onPress={onConfirm}
            loading={loading}
            fullWidth
          />
        </View>
      </View>
    </NeuSurface>
  );
}

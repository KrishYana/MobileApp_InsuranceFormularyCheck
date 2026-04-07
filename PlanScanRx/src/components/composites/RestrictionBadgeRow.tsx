import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Spacing } from '../../theme/spacing';
import { Badge } from '../primitives';

type RestrictionBadgeRowProps = {
  priorAuth: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
  specialtyDrug: boolean;
  isControlled: boolean;
  deaSchedule: string | null;
};

export function RestrictionBadgeRow({
  priorAuth,
  stepTherapy,
  quantityLimit,
  specialtyDrug,
  isControlled,
  deaSchedule,
}: RestrictionBadgeRowProps) {
  const { theme } = useTheme();

  const badges: { label: string; color: string; bg: string }[] = [];

  if (priorAuth) badges.push({ label: 'PA Required', color: theme.statusPriorAuth, bg: theme.statusPriorAuthBg });
  if (stepTherapy) badges.push({ label: 'Step Therapy', color: theme.statusStepTherapy, bg: theme.statusStepTherapyBg });
  if (quantityLimit) badges.push({ label: 'Qty Limit', color: theme.statusQuantityLimit, bg: theme.statusQuantityLimitBg });
  if (specialtyDrug) badges.push({ label: 'Specialty', color: theme.statusSpecialty, bg: theme.statusSpecialtyBg });
  if (isControlled && deaSchedule) badges.push({ label: `Schedule ${deaSchedule}`, color: theme.statusControlled, bg: theme.statusControlledBg });

  if (badges.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
      {badges.map((b) => (
        <Badge key={b.label} variant="restriction" label={b.label} color={b.color} backgroundColor={b.bg} />
      ))}
    </View>
  );
}

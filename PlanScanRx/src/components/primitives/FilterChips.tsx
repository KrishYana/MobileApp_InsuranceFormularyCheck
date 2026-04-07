import React, { useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { TouchTarget } from '../../theme/touchTarget';
import { Animation } from '../../theme/animation';
import { NeuSurface } from './NeuSurface';
import { NeuInset } from './NeuInset';

type FilterChip = {
  id: string;
  label: string;
  active: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
};

type FilterChipsProps = {
  filters: FilterChip[];
  onToggle: (id: string) => void;
  onClearAll?: () => void;
};

function Chip({ chip, onToggle }: { chip: FilterChip; onToggle: (id: string) => void }) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  const isDisabled = chip.disabled || chip.comingSoon;

  const inner = (
    <Pressable
      onPress={() => !isDisabled && onToggle(chip.id)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isDisabled}
      style={{
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        opacity: isDisabled ? 0.5 : 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: chip.active ? theme.accent : theme.surface,
        transform: [{ scale: pressed ? Animation.pressScale.chip : 1 }],
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: chip.active, disabled: isDisabled }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
        <Text
          style={{
            ...Typography.label,
            color: chip.active ? theme.textInverse : theme.textPrimary,
          }}>
          {chip.label}
        </Text>
        {chip.comingSoon && (
          <Text style={{ ...Typography.badge, color: theme.textSecondary }}>Soon</Text>
        )}
      </View>
    </Pressable>
  );

  // Active chips are inset (pressed into surface), inactive are extruded
  if (chip.active) {
    return (
      <NeuInset level="insetSmall" cornerRadius={Radius.full}>
        {inner}
      </NeuInset>
    );
  }

  return (
    <NeuSurface level="extrudedSmall" cornerRadius={Radius.full}>
      {inner}
    </NeuSurface>
  );
}

export function FilterChips({ filters, onToggle, onClearAll }: FilterChipsProps) {
  const { theme } = useTheme();
  const activeCount = filters.filter((f) => f.active).length;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: Spacing.xl,
        gap: Spacing.md,
        alignItems: 'center',
        paddingVertical: Spacing.sm,
      }}>
      {activeCount > 0 && onClearAll && (
        <Pressable
          onPress={onClearAll}
          style={{
            minHeight: TouchTarget.minimum,
            justifyContent: 'center',
            paddingHorizontal: Spacing.md,
          }}>
          <Text style={{ ...Typography.label, color: theme.error }}>Clear</Text>
        </Pressable>
      )}
      {filters.map((chip) => (
        <Chip key={chip.id} chip={chip} onToggle={onToggle} />
      ))}
    </ScrollView>
  );
}

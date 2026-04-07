import React, { useState, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Animation } from '../../theme/animation';
import { NeuSurface } from '../primitives';
import type { Drug } from '../../types/domain';

type DrugAutocompleteItemProps = {
  drug: Drug;
  searchQuery: string;
  onPress: (drug: Drug) => void;
};

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  const { theme } = useTheme();

  if (!highlight || highlight.length < 2) {
    return <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={i} style={{ color: theme.accent, fontWeight: '700' }}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
}

export function DrugAutocompleteItem({ drug, searchQuery, onPress }: DrugAutocompleteItemProps) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);

  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (drug.genericName && drug.genericName !== drug.drugName) parts.push(drug.genericName);
    if (drug.strength) parts.push(drug.strength);
    if (drug.doseForm) parts.push(drug.doseForm);
    if (drug.route) parts.push(drug.route);
    return parts.join(' · ');
  }, [drug]);

  return (
    <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
      <Pressable
        onPress={() => onPress(drug)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={{
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          borderRadius: Radius.base,
          backgroundColor: theme.surface,
          transform: [{ scale: pressed ? Animation.pressScale.card : 1 }],
        }}
        accessibilityRole="button"
        accessibilityLabel={`${drug.drugName}${subtitle ? `, ${subtitle}` : ''}`}>
        <HighlightedText text={drug.drugName} highlight={searchQuery} />
        {subtitle.length > 0 && (
          <Text
            style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}
            numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {(drug.isSpecialty || drug.isControlled) && (
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
            {drug.isSpecialty && (
              <View style={{ backgroundColor: theme.statusSpecialtyBg, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs, borderRadius: Radius.inner }}>
                <Text style={{ ...Typography.badge, color: theme.statusSpecialty }}>SPECIALTY</Text>
              </View>
            )}
            {drug.isControlled && drug.deaSchedule && (
              <View style={{ backgroundColor: theme.statusControlledBg, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs, borderRadius: Radius.inner }}>
                <Text style={{ ...Typography.badge, color: theme.statusControlled }}>SCHEDULE {drug.deaSchedule}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </NeuSurface>
  );
}

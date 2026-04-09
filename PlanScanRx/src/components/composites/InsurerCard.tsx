import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Animation } from '../../theme/animation';
import { TouchTarget } from '../../theme/touchTarget';
import { NeuSurface, NeuInset, AppIcon } from '../primitives';

type InsurerCardProps = {
  name: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function InsurerCard({ name, selected, onPress, disabled = false }: InsurerCardProps) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);

  const inner = (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: TouchTarget.recommended,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.base,
        backgroundColor: theme.surface,
        opacity: disabled ? 0.5 : 1,
        transform: [{ scale: pressed ? Animation.pressScale.card : 1 }],
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${name}${selected ? ', selected' : ''}`}>
      <Text
        style={{
          ...Typography.bodyMedium,
          color: selected ? theme.textAccent : theme.textPrimary,
          flex: 1,
        }}
        numberOfLines={1}>
        {name}
      </Text>
      {selected && (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.accent,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <AppIcon name="check" size={14} color={theme.textInverse} />
        </View>
      )}
    </Pressable>
  );

  if (selected) {
    return <NeuInset level="insetSmall" cornerRadius={Radius.base}>{inner}</NeuInset>;
  }

  return <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>{inner}</NeuSurface>;
}

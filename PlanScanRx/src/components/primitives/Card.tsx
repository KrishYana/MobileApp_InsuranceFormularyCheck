import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';
import { Animation } from '../../theme/animation';
import { NeuSurface } from './NeuSurface';
import type { NeuShadowLevel } from '../../theme/shadows';

type CardVariant = 'default' | 'elevated' | 'status';

type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  statusColor?: string;
  onPress?: () => void;
  padding?: keyof typeof Spacing;
  accessibilityLabel?: string;
};

const levelMap: Record<CardVariant, NeuShadowLevel> = {
  default: 'extruded',
  elevated: 'lifted',
  status: 'extruded',
};

export function Card({
  children,
  variant = 'default',
  statusColor,
  onPress,
  padding = 'xxl',
  accessibilityLabel,
}: CardProps) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);

  const innerContent = (
    <View
      style={{
        padding: Spacing[padding],
        borderRadius: Radius.container,
        backgroundColor: theme.surface,
        ...(variant === 'status' && statusColor
          ? { borderLeftWidth: 4, borderLeftColor: statusColor }
          : {}),
        transform: [{ scale: pressed ? Animation.pressScale.card : 1 }],
      }}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <NeuSurface
        level={pressed ? 'extrudedSmall' : levelMap[variant]}
        cornerRadius={Radius.container}>
        <Pressable
          onPress={onPress}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}>
          {innerContent}
        </Pressable>
      </NeuSurface>
    );
  }

  return (
    <NeuSurface level={levelMap[variant]} cornerRadius={Radius.container}>
      {innerContent}
    </NeuSurface>
  );
}

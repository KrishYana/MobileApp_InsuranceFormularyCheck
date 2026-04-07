import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { NeuInset } from './NeuInset';

type NeuIconWellProps = {
  icon: React.ReactNode | string;
  size?: number;
  iconColor?: string;
};

/**
 * Neumorphic icon well — "drilled" into the surface.
 * Used inside cards for visual anchoring.
 */
export function NeuIconWell({ icon, size = 48, iconColor }: NeuIconWellProps) {
  const { theme } = useTheme();
  const color = iconColor ?? theme.accent;
  const cornerRadius = size * 0.35;

  return (
    <NeuInset level="insetDeep" cornerRadius={cornerRadius}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: cornerRadius,
          backgroundColor: theme.surface,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {typeof icon === 'string' ? (
          <Text style={{ fontSize: size * 0.45, color }}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
    </NeuInset>
  );
}

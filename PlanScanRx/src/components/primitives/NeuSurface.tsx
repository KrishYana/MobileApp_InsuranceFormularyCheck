import React, { useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { NeuShadows, type NeuShadowLevel } from '../../theme/shadows';
import { Radius } from '../../theme/radius';

type NeuSurfaceProps = {
  children: React.ReactNode;
  level?: NeuShadowLevel;
  cornerRadius?: number;
  style?: ViewStyle;
};

/**
 * Core neumorphic building block.
 * Renders TWO nested Views to produce dual opposing shadows
 * (light top-left, dark bottom-right) on the same-color background.
 *
 * Usage:
 *   <NeuSurface level="extruded" cornerRadius={Radius.container}>
 *     <Text>Card content</Text>
 *   </NeuSurface>
 */
export function NeuSurface({
  children,
  level = 'extruded',
  cornerRadius = Radius.base,
  style,
}: NeuSurfaceProps) {
  const { theme } = useTheme();
  const shadows = NeuShadows[level];

  const outerStyle = useMemo((): ViewStyle => ({
    borderRadius: cornerRadius,
    backgroundColor: theme.surface,
    ...shadows.dark,
  }), [cornerRadius, theme.surface, shadows.dark]);

  const innerStyle = useMemo((): ViewStyle => ({
    borderRadius: cornerRadius,
    backgroundColor: theme.surface,
    ...shadows.light,
  }), [cornerRadius, theme.surface, shadows.light]);

  if (level === 'none') {
    return (
      <View style={[{ borderRadius: cornerRadius, backgroundColor: theme.surface }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[outerStyle, style]}>
      <View style={innerStyle}>
        {children}
      </View>
    </View>
  );
}

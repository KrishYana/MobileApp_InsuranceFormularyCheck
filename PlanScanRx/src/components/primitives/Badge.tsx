import React, { useMemo } from 'react';
import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';
import { NeuSurface } from './NeuSurface';

type BadgeVariant = 'coverage' | 'restriction' | 'tier' | 'count' | 'info';

type BadgeProps = {
  variant?: BadgeVariant;
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
};

export function Badge({
  variant = 'info',
  label,
  color,
  backgroundColor,
  size = 'sm',
  icon,
}: BadgeProps) {
  const { theme } = useTheme();

  const resolvedColors = useMemo(() => {
    if (color && backgroundColor) return { fg: color, bg: backgroundColor };
    switch (variant) {
      case 'coverage':
        return { fg: theme.statusCovered, bg: theme.statusCoveredBg };
      case 'restriction':
        return { fg: theme.statusPriorAuth, bg: theme.statusPriorAuthBg };
      case 'tier':
        return { fg: theme.tierLow, bg: theme.statusCoveredBg };
      case 'count':
        return { fg: theme.textInverse, bg: theme.accent };
      case 'info':
      default:
        return { fg: theme.textSecondary, bg: theme.surface };
    }
  }, [variant, color, backgroundColor, theme]);

  const isNeutral = variant === 'info';
  const innerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: resolvedColors.bg,
    borderRadius: Radius.inner,
    paddingHorizontal: size === 'sm' ? Spacing.sm : Spacing.md,
    paddingVertical: size === 'sm' ? Spacing.xs : Spacing.sm,
    alignSelf: 'flex-start',
  };

  const textStyle: TextStyle = {
    ...Typography.badge,
    color: resolvedColors.fg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  // Neutral badges get neumorphic surface, colored badges are flat
  if (isNeutral) {
    return (
      <NeuSurface level="extrudedSmall" cornerRadius={Radius.inner}>
        <View style={innerStyle} accessibilityLabel={label}>
          {icon}
          <Text style={textStyle}>{label}</Text>
        </View>
      </NeuSurface>
    );
  }

  return (
    <View style={innerStyle} accessibilityLabel={label}>
      {icon}
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

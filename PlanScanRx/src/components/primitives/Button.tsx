import React, { useState, useMemo } from 'react';
import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';
import { TouchTarget } from '../../theme/touchTarget';
import { Animation } from '../../theme/animation';
import { NeuSurface } from './NeuSurface';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  accessibilityLabel?: string;
};

const heights: Record<ButtonSize, number> = { sm: 40, md: 48, lg: 52 };

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  const isPrimary = variant === 'primary';
  const isTertiary = variant === 'tertiary';
  const isDestructive = variant === 'destructive';

  const bgColor = isPrimary
    ? theme.accent
    : isDestructive
      ? theme.error
      : theme.surface;

  const textColor = isPrimary || isDestructive
    ? theme.textInverse
    : isTertiary
      ? theme.textAccent
      : theme.textPrimary;

  const innerStyle = useMemo((): ViewStyle => ({
    height: heights[size],
    minWidth: TouchTarget.minimum,
    borderRadius: Radius.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isTertiary ? Spacing.sm : Spacing.xxl,
    gap: Spacing.sm,
    backgroundColor: bgColor,
    opacity: isDisabled ? 0.5 : 1,
    transform: [{ scale: pressed && !isDisabled ? Animation.pressScale.button : 1 }],
    ...(fullWidth && { width: '100%' as any }),
  }), [size, isTertiary, bgColor, isDisabled, pressed, fullWidth]);

  const content = (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={innerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={{ ...Typography.button, color: textColor }}>{label}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </Pressable>
  );

  // Tertiary buttons have no shadow (they're text links)
  if (isTertiary) return content;

  // Wrap in neumorphic surface for raised effect
  return (
    <NeuSurface
      level={pressed ? 'extrudedSmall' : 'extruded'}
      cornerRadius={Radius.base}
      style={fullWidth ? { width: '100%' } : undefined}>
      {content}
    </NeuSurface>
  );
}

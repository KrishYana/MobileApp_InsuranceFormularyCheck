import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { NeuInsets, type NeuInsetLevel } from '../../theme/shadows';
import { Radius } from '../../theme/radius';

type NeuInsetProps = {
  children: React.ReactNode;
  level?: NeuInsetLevel;
  cornerRadius?: number;
  focused?: boolean;
  style?: ViewStyle;
};

/**
 * Neumorphic inset (carved-in) effect for text fields, icon wells, pressed states.
 * Simulates inner shadows using border + opacity overlays since RN has no inset shadow.
 */
export function NeuInset({
  children,
  level = 'inset',
  cornerRadius = Radius.base,
  focused = false,
  style,
}: NeuInsetProps) {
  const { theme } = useTheme();
  const config = NeuInsets[level];

  return (
    <View
      style={[
        {
          borderRadius: cornerRadius,
          backgroundColor: theme.surface,
          overflow: 'hidden',
        },
        style,
      ]}>
      {/* Dark inner shadow (top-left) */}
      <View
        style={{
          position: 'absolute',
          top: -config.offset,
          left: -config.offset,
          right: config.offset,
          bottom: config.offset,
          borderRadius: cornerRadius,
          borderWidth: config.offset,
          borderColor: theme.shadowDark,
          opacity: config.darkOpacity,
        }}
        pointerEvents="none"
      />
      {/* Light inner shadow (bottom-right) */}
      <View
        style={{
          position: 'absolute',
          top: config.offset,
          left: config.offset,
          right: -config.offset,
          bottom: -config.offset,
          borderRadius: cornerRadius,
          borderWidth: config.offset,
          borderColor: theme.shadowLight,
          opacity: config.lightOpacity,
        }}
        pointerEvents="none"
      />
      {/* Focus ring */}
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: cornerRadius,
            borderWidth: 2,
            borderColor: theme.accent,
          }}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

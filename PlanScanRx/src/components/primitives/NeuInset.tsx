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
 * Simulates inner shadows using semi-transparent gradient overlays positioned
 * at top-left (dark) and bottom-right (light) to create a soft recessed look.
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

  // The overlay thickness determines how deep the inset looks
  const thickness = config.offset + config.blur * 0.3;

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
      {/* Dark shadow overlay — top and left edges (light source from top-left) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: thickness,
          borderTopLeftRadius: cornerRadius,
          borderTopRightRadius: cornerRadius,
          backgroundColor: theme.shadowDark,
          opacity: config.darkOpacity * 0.35,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: thickness,
          borderTopLeftRadius: cornerRadius,
          borderBottomLeftRadius: cornerRadius,
          backgroundColor: theme.shadowDark,
          opacity: config.darkOpacity * 0.25,
        }}
        pointerEvents="none"
      />

      {/* Light shadow overlay — bottom and right edges */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: thickness,
          borderBottomLeftRadius: cornerRadius,
          borderBottomRightRadius: cornerRadius,
          backgroundColor: theme.shadowLight,
          opacity: config.lightOpacity * 0.4,
        }}
        pointerEvents="none"
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: thickness,
          borderTopRightRadius: cornerRadius,
          borderBottomRightRadius: cornerRadius,
          backgroundColor: theme.shadowLight,
          opacity: config.lightOpacity * 0.3,
        }}
        pointerEvents="none"
      />

      {/* Subtle overall darkening to enhance the "recessed" feel */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: cornerRadius,
          backgroundColor: theme.shadowDark,
          opacity: config.darkOpacity * 0.08,
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

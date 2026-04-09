import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { NeuInset } from './NeuInset';
import { AppIcon, AppIcons } from './Icon';

type NeuIconWellProps = {
  icon?: keyof typeof AppIcons;
  size?: number;
  iconColor?: string;
  children?: React.ReactNode;
};

/**
 * Neumorphic icon well -- "drilled" into the surface.
 * Used inside cards for visual anchoring.
 *
 * Accepts either a semantic icon name (from AppIcons) via the `icon` prop,
 * or arbitrary ReactNode children for custom content.
 */
export function NeuIconWell({ icon, size = 48, iconColor, children }: NeuIconWellProps) {
  const { theme, isDark } = useTheme();
  const color = iconColor ?? theme.accent;
  const cornerRadius = size * 0.35;

  // 3% darker than surface so the well is visible
  const wellBg = isDark
    ? 'rgba(255,255,255,0.03)'
    : 'rgba(0,0,0,0.03)';

  const renderContent = () => {
    // Prefer children if provided (for backward compat / custom content)
    if (children) return children;
    // Look up icon name in AppIcons
    if (icon) {
      return <AppIcon name={icon} size={size * 0.45} color={color} />;
    }
    return null;
  };

  return (
    <NeuInset level="insetDeep" cornerRadius={cornerRadius}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: cornerRadius,
          backgroundColor: wellBg,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {renderContent()}
      </View>
    </NeuInset>
  );
}

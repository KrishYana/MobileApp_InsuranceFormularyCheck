// Neumorphic palette — NEVER import directly in components. Use useTheme().
// All visual interest comes from shadow play, not color variety.

export const palette = {
  // The single base surface
  background: '#E0E5EC',

  // Text
  foreground: '#3D4852',   // 7.5:1 contrast (WCAG AAA)
  muted: '#6B7280',        // 4.6:1 contrast (WCAG AA)

  // Accent
  accent: '#6C63FF',       // Soft violet — CTAs, focus rings
  accentLight: '#8B84FF',  // Lighter violet for gradients
  teal: '#38B2AC',         // Success states, positive indicators

  // Shadows (always use with opacity — never opaque)
  shadowLightColor: 'rgba(255, 255, 255, 0.55)',
  shadowDarkColor: 'rgba(163, 177, 198, 0.65)',

  // Status colors (used sparingly — neumorphism is monochromatic)
  green: '#10B981',
  red: '#EF4444',
  yellow: '#F59E0B',
  blue: '#3B82F6',
  purple: '#A855F7',
  orange: '#F97316',

  // Status backgrounds (subtle tints on #E0E5EC base)
  greenBg: '#D6F0E5',
  redBg: '#F5D9D9',
  yellowBg: '#F5ECD0',
  blueBg: '#D9E6F5',
  purpleBg: '#E8DCF5',
  orangeBg: '#F5E2D0',

  // Dark mode
  dark: {
    background: '#1E2530',
    foreground: '#E8EDF4',
    muted: '#8B95A5',
    shadowLight: 'rgba(42, 52, 70, 0.8)',
    shadowDark: 'rgba(10, 14, 20, 0.9)',
    statusGreenBg: '#1A2E24',
    statusRedBg: '#2E1A1C',
    statusYellowBg: '#2E2A1A',
    statusBlueBg: '#1A1E2E',
    statusPurpleBg: '#231A2E',
    statusOrangeBg: '#2E221A',
  },

  // Absolute
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

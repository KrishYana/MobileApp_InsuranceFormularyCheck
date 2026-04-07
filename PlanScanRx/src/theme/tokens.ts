import { palette } from './palette';

export type ThemeTokens = {
  // Core surfaces — all the same base color (neumorphic same-surface illusion)
  surface: string;
  surfaceElevated: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;
  textAccent: string;

  // Accent
  accent: string;
  accentLight: string;
  teal: string;

  // Neumorphic shadows
  shadowLight: string;
  shadowDark: string;

  // Status
  statusCovered: string;
  statusCoveredBg: string;
  statusNotCovered: string;
  statusNotCoveredBg: string;
  statusPriorAuth: string;
  statusPriorAuthBg: string;
  statusStepTherapy: string;
  statusStepTherapyBg: string;
  statusQuantityLimit: string;
  statusQuantityLimitBg: string;
  statusSpecialty: string;
  statusSpecialtyBg: string;
  statusControlled: string;
  statusControlledBg: string;

  // Freshness
  freshnessGreen: string;
  freshnessAmber: string;
  freshnessRed: string;
  freshnessUnknown: string;

  // Tier
  tierLow: string;
  tierMid: string;
  tierHigh: string;

  // Feedback
  success: string;
  warning: string;
  error: string;
  info: string;

  // Overlay
  overlay: string;

  // Platform auth buttons
  appleButtonBg: string;
  appleButtonText: string;
  googleButtonBg: string;
  googleButtonText: string;
  googleButtonBorder: string;

  // Splash
  splashBg: string;
};

export const lightTheme: ThemeTokens = {
  surface: palette.background,
  surfaceElevated: palette.background,

  textPrimary: palette.foreground,
  textSecondary: palette.muted,
  textDisabled: '#A0AEC0',
  textInverse: palette.white,
  textAccent: palette.accent,

  accent: palette.accent,
  accentLight: palette.accentLight,
  teal: palette.teal,

  shadowLight: palette.shadowLightColor,
  shadowDark: palette.shadowDarkColor,

  statusCovered: palette.green,
  statusCoveredBg: palette.greenBg,
  statusNotCovered: palette.red,
  statusNotCoveredBg: palette.redBg,
  statusPriorAuth: palette.yellow,
  statusPriorAuthBg: palette.yellowBg,
  statusStepTherapy: palette.blue,
  statusStepTherapyBg: palette.blueBg,
  statusQuantityLimit: palette.muted,
  statusQuantityLimitBg: palette.background,
  statusSpecialty: palette.purple,
  statusSpecialtyBg: palette.purpleBg,
  statusControlled: palette.orange,
  statusControlledBg: palette.orangeBg,

  freshnessGreen: palette.green,
  freshnessAmber: palette.yellow,
  freshnessRed: palette.red,
  freshnessUnknown: palette.muted,

  tierLow: palette.teal,
  tierMid: palette.yellow,
  tierHigh: palette.red,

  success: palette.teal,
  warning: palette.yellow,
  error: palette.red,
  info: palette.blue,

  overlay: 'rgba(0, 0, 0, 0.4)',

  appleButtonBg: palette.black,
  appleButtonText: palette.white,
  googleButtonBg: palette.background,
  googleButtonText: palette.foreground,
  googleButtonBorder: palette.muted,

  splashBg: palette.black,
};

export const darkTheme: ThemeTokens = {
  surface: palette.dark.background,
  surfaceElevated: palette.dark.background,

  textPrimary: palette.dark.foreground,
  textSecondary: palette.dark.muted,
  textDisabled: '#4A5568',
  textInverse: palette.dark.background,
  textAccent: palette.accentLight,

  accent: palette.accent,
  accentLight: palette.accentLight,
  teal: palette.teal,

  shadowLight: palette.dark.shadowLight,
  shadowDark: palette.dark.shadowDark,

  statusCovered: palette.green,
  statusCoveredBg: palette.dark.statusGreenBg,
  statusNotCovered: palette.red,
  statusNotCoveredBg: palette.dark.statusRedBg,
  statusPriorAuth: palette.yellow,
  statusPriorAuthBg: palette.dark.statusYellowBg,
  statusStepTherapy: palette.blue,
  statusStepTherapyBg: palette.dark.statusBlueBg,
  statusQuantityLimit: palette.dark.muted,
  statusQuantityLimitBg: palette.dark.background,
  statusSpecialty: palette.purple,
  statusSpecialtyBg: palette.dark.statusPurpleBg,
  statusControlled: palette.orange,
  statusControlledBg: palette.dark.statusOrangeBg,

  freshnessGreen: palette.green,
  freshnessAmber: palette.yellow,
  freshnessRed: palette.red,
  freshnessUnknown: palette.dark.muted,

  tierLow: palette.teal,
  tierMid: palette.yellow,
  tierHigh: palette.red,

  success: palette.teal,
  warning: palette.yellow,
  error: palette.red,
  info: palette.blue,

  overlay: 'rgba(0, 0, 0, 0.7)',

  appleButtonBg: palette.white,
  appleButtonText: palette.black,
  googleButtonBg: palette.dark.background,
  googleButtonText: palette.dark.foreground,
  googleButtonBorder: palette.dark.muted,

  splashBg: palette.black,
};

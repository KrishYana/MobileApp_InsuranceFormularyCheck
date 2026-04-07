import { Platform, TextStyle } from 'react-native';

// Neumorphic typography:
// Display: Plus Jakarta Sans (600, 700, 800)
// Body: DM Sans (400, 500, 700)
// Fallback to system fonts until custom fonts are installed.

const displayFont = Platform.select({
  ios: 'PlusJakartaSans-Bold',
  android: 'PlusJakartaSans-Bold',
  default: 'System',
});

const displayFontSemiBold = Platform.select({
  ios: 'PlusJakartaSans-SemiBold',
  android: 'PlusJakartaSans-SemiBold',
  default: 'System',
});

const displayFontExtraBold = Platform.select({
  ios: 'PlusJakartaSans-ExtraBold',
  android: 'PlusJakartaSans-ExtraBold',
  default: 'System',
});

const bodyFont = Platform.select({
  ios: 'DMSans-Regular',
  android: 'DMSans-Regular',
  default: 'System',
});

const bodyFontMedium = Platform.select({
  ios: 'DMSans-Medium',
  android: 'DMSans-Medium',
  default: 'System',
});

const bodyFontBold = Platform.select({
  ios: 'DMSans-Bold',
  android: 'DMSans-Bold',
  default: 'System',
});

export const Typography = {
  // Display scale (Plus Jakarta Sans)
  display:   { fontFamily: displayFontExtraBold, fontSize: 40, lineHeight: 48, fontWeight: '800' } as TextStyle,
  title1:    { fontFamily: displayFont, fontSize: 28, lineHeight: 36, fontWeight: '700' } as TextStyle,
  title2:    { fontFamily: displayFont, fontSize: 22, lineHeight: 30, fontWeight: '700' } as TextStyle,
  title3:    { fontFamily: displayFontSemiBold, fontSize: 18, lineHeight: 24, fontWeight: '600' } as TextStyle,

  // Body scale (DM Sans)
  body:      { fontFamily: bodyFont, fontSize: 16, lineHeight: 22, fontWeight: '400' } as TextStyle,
  bodyMedium:{ fontFamily: bodyFontMedium, fontSize: 16, lineHeight: 22, fontWeight: '500' } as TextStyle,
  bodyBold:  { fontFamily: bodyFontBold, fontSize: 16, lineHeight: 22, fontWeight: '700' } as TextStyle,
  label:     { fontFamily: bodyFontMedium, fontSize: 14, lineHeight: 18, fontWeight: '500' } as TextStyle,
  caption:   { fontFamily: bodyFont, fontSize: 13, lineHeight: 18, fontWeight: '400' } as TextStyle,
  badge:     { fontFamily: bodyFontBold, fontSize: 11, lineHeight: 14, fontWeight: '700' } as TextStyle,

  // Button (DM Sans Medium for physical button feel)
  button:    { fontFamily: bodyFontMedium, fontSize: 16, lineHeight: 22, fontWeight: '500' } as TextStyle,
} as const;

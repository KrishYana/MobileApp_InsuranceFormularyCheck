// Neumorphic dual shadow system.
// Every element gets TWO shadows: light (top-left) + dark (bottom-right).
// React Native only supports one shadow per View, so we layer two Views.
// Note: elevation is set to 0 to prevent Android's native elevation
// from creating a double-shadow effect on top of our custom shadows.

export type NeuShadowLevel = 'extruded' | 'extrudedSmall' | 'pressed' | 'lifted' | 'none';

export type NeuShadowPair = {
  light: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  dark: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

// For inset shadows (text fields, icon wells, pressed states)
export type NeuInsetLevel = 'inset' | 'insetDeep' | 'insetSmall';

export type NeuInsetConfig = {
  offset: number;
  blur: number;
  lightOpacity: number;
  darkOpacity: number;
};

export const NeuShadows: Record<NeuShadowLevel, NeuShadowPair> = {
  extruded: {
    light: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -9, height: -9 },
      shadowOpacity: 0.55,
      shadowRadius: 16,
      elevation: 0,
    },
    dark: {
      shadowColor: '#A3B1C6',
      shadowOffset: { width: 9, height: 9 },
      shadowOpacity: 0.65,
      shadowRadius: 16,
      elevation: 0,
    },
  },
  extrudedSmall: {
    light: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -5, height: -5 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 0,
    },
    dark: {
      shadowColor: '#A3B1C6',
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 0,
    },
  },
  // Between extrudedSmall and inset — for actively-held-down buttons
  pressed: {
    light: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 0,
    },
    dark: {
      shadowColor: '#A3B1C6',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 0,
    },
  },
  lifted: {
    light: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -12, height: -12 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 0,
    },
    dark: {
      shadowColor: '#A3B1C6',
      shadowOffset: { width: 12, height: 12 },
      shadowOpacity: 0.7,
      shadowRadius: 20,
      elevation: 0,
    },
  },
  none: {
    light: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    dark: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
};

export const NeuInsets: Record<NeuInsetLevel, NeuInsetConfig> = {
  inset: { offset: 6, blur: 10, lightOpacity: 0.5, darkOpacity: 0.6 },
  insetDeep: { offset: 10, blur: 20, lightOpacity: 0.6, darkOpacity: 0.7 },
  insetSmall: { offset: 3, blur: 6, lightOpacity: 0.5, darkOpacity: 0.6 },
};

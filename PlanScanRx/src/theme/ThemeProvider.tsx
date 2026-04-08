import React, { createContext, useContext, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, type ThemeTokens } from './tokens';
import { useSettingsStore } from '../stores/settingsStore';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: ThemeTokens;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const mode = useSettingsStore((s) => s.themeMode);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  const setMode = useCallback((newMode: ThemeMode) => {
    useSettingsStore.getState().setThemeMode(newMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

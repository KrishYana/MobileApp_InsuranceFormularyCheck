import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type RetentionPeriod = 'forever' | '90days' | '30days' | 'off';

type SettingsStore = {
  // Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  formularyAlerts: boolean;
  setFormularyAlerts: (enabled: boolean) => void;
  priceChangeAlerts: boolean;
  setPriceChangeAlerts: (enabled: boolean) => void;

  // Data retention
  searchHistoryRetention: RetentionPeriod;
  setSearchHistoryRetention: (period: RetentionPeriod) => void;
  savedLookupsRetention: RetentionPeriod;
  setSavedLookupsRetention: (period: RetentionPeriod) => void;

  // Reset
  resetSettings: () => void;
};

const defaults = {
  themeMode: 'system' as ThemeMode,
  notificationsEnabled: true,
  formularyAlerts: true,
  priceChangeAlerts: true,
  searchHistoryRetention: 'forever' as RetentionPeriod,
  savedLookupsRetention: 'forever' as RetentionPeriod,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,

      setThemeMode: (mode) => set({ themeMode: mode }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setFormularyAlerts: (enabled) => set({ formularyAlerts: enabled }),
      setPriceChangeAlerts: (enabled) => set({ priceChangeAlerts: enabled }),

      setSearchHistoryRetention: (period) => set({ searchHistoryRetention: period }),
      setSavedLookupsRetention: (period) => set({ savedLookupsRetention: period }),

      resetSettings: () => set(defaults),
    }),
    {
      name: '@planscanrx/settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

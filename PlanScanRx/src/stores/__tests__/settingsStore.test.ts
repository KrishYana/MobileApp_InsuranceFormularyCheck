import { useSettingsStore } from '../settingsStore';

const defaults = {
  themeMode: 'system' as const,
  notificationsEnabled: true,
  formularyAlerts: true,
  priceChangeAlerts: true,
  searchHistoryRetention: 'forever' as const,
  savedLookupsRetention: 'forever' as const,
};

beforeEach(() => {
  useSettingsStore.setState(defaults);
});

describe('settingsStore', () => {
  describe('initial defaults', () => {
    it('has themeMode set to system', () => {
      expect(useSettingsStore.getState().themeMode).toBe('system');
    });

    it('has notificationsEnabled set to true', () => {
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
    });

    it('has formularyAlerts set to true', () => {
      expect(useSettingsStore.getState().formularyAlerts).toBe(true);
    });

    it('has priceChangeAlerts set to true', () => {
      expect(useSettingsStore.getState().priceChangeAlerts).toBe(true);
    });

    it('has searchHistoryRetention set to forever', () => {
      expect(useSettingsStore.getState().searchHistoryRetention).toBe('forever');
    });

    it('has savedLookupsRetention set to forever', () => {
      expect(useSettingsStore.getState().savedLookupsRetention).toBe('forever');
    });
  });

  describe('setThemeMode', () => {
    it('changes to dark mode', () => {
      useSettingsStore.getState().setThemeMode('dark');
      expect(useSettingsStore.getState().themeMode).toBe('dark');
    });

    it('changes to light mode', () => {
      useSettingsStore.getState().setThemeMode('light');
      expect(useSettingsStore.getState().themeMode).toBe('light');
    });

    it('changes back to system', () => {
      useSettingsStore.getState().setThemeMode('dark');
      useSettingsStore.getState().setThemeMode('system');
      expect(useSettingsStore.getState().themeMode).toBe('system');
    });
  });

  describe('setNotificationsEnabled', () => {
    it('disables notifications', () => {
      useSettingsStore.getState().setNotificationsEnabled(false);
      expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
    });

    it('re-enables notifications', () => {
      useSettingsStore.getState().setNotificationsEnabled(false);
      useSettingsStore.getState().setNotificationsEnabled(true);
      expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
    });
  });

  describe('setFormularyAlerts', () => {
    it('disables formulary alerts', () => {
      useSettingsStore.getState().setFormularyAlerts(false);
      expect(useSettingsStore.getState().formularyAlerts).toBe(false);
    });
  });

  describe('setPriceChangeAlerts', () => {
    it('disables price change alerts', () => {
      useSettingsStore.getState().setPriceChangeAlerts(false);
      expect(useSettingsStore.getState().priceChangeAlerts).toBe(false);
    });
  });

  describe('setSearchHistoryRetention', () => {
    it('changes to 90 days', () => {
      useSettingsStore.getState().setSearchHistoryRetention('90days');
      expect(useSettingsStore.getState().searchHistoryRetention).toBe('90days');
    });

    it('changes to 30 days', () => {
      useSettingsStore.getState().setSearchHistoryRetention('30days');
      expect(useSettingsStore.getState().searchHistoryRetention).toBe('30days');
    });

    it('changes to off', () => {
      useSettingsStore.getState().setSearchHistoryRetention('off');
      expect(useSettingsStore.getState().searchHistoryRetention).toBe('off');
    });
  });

  describe('setSavedLookupsRetention', () => {
    it('changes to 90 days', () => {
      useSettingsStore.getState().setSavedLookupsRetention('90days');
      expect(useSettingsStore.getState().savedLookupsRetention).toBe('90days');
    });
  });

  describe('resetSettings', () => {
    it('restores all settings to defaults', () => {
      // Change everything
      useSettingsStore.getState().setThemeMode('dark');
      useSettingsStore.getState().setNotificationsEnabled(false);
      useSettingsStore.getState().setFormularyAlerts(false);
      useSettingsStore.getState().setPriceChangeAlerts(false);
      useSettingsStore.getState().setSearchHistoryRetention('30days');
      useSettingsStore.getState().setSavedLookupsRetention('off');

      // Reset
      useSettingsStore.getState().resetSettings();

      const state = useSettingsStore.getState();
      expect(state.themeMode).toBe('system');
      expect(state.notificationsEnabled).toBe(true);
      expect(state.formularyAlerts).toBe(true);
      expect(state.priceChangeAlerts).toBe(true);
      expect(state.searchHistoryRetention).toBe('forever');
      expect(state.savedLookupsRetention).toBe('forever');
    });
  });

  describe('persistence configuration', () => {
    it('uses the correct persistence key', () => {
      const persistOptions = (useSettingsStore as any).persist;
      expect(persistOptions.getOptions().name).toBe('@planscanrx/settings-store');
    });
  });
});

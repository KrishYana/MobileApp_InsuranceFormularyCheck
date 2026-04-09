import { useAppStore } from '../appStore';

// Reset store between tests
beforeEach(() => {
  useAppStore.setState({
    selectedState: null,
    planFilters: {
      planType: null,
      marketType: null,
      metalLevel: null,
      planYear: null,
    },
    isOnline: true,
  });
});

describe('appStore', () => {
  describe('initial state', () => {
    it('has null selectedState', () => {
      expect(useAppStore.getState().selectedState).toBeNull();
    });

    it('has default plan filters with all nulls', () => {
      const { planFilters } = useAppStore.getState();
      expect(planFilters.planType).toBeNull();
      expect(planFilters.marketType).toBeNull();
      expect(planFilters.metalLevel).toBeNull();
      expect(planFilters.planYear).toBeNull();
    });

    it('starts online', () => {
      expect(useAppStore.getState().isOnline).toBe(true);
    });
  });

  describe('setSelectedState', () => {
    it('updates the selected state', () => {
      useAppStore.getState().setSelectedState({ code: 'CA', name: 'California' });
      expect(useAppStore.getState().selectedState).toEqual({ code: 'CA', name: 'California' });
    });

    it('replaces the previously selected state', () => {
      useAppStore.getState().setSelectedState({ code: 'CA', name: 'California' });
      useAppStore.getState().setSelectedState({ code: 'NY', name: 'New York' });
      expect(useAppStore.getState().selectedState).toEqual({ code: 'NY', name: 'New York' });
    });
  });

  describe('setPlanFilters', () => {
    it('applies a partial filter update', () => {
      useAppStore.getState().setPlanFilters({ planType: 'HMO' });
      expect(useAppStore.getState().planFilters.planType).toBe('HMO');
      expect(useAppStore.getState().planFilters.marketType).toBeNull();
    });

    it('merges multiple partial updates', () => {
      useAppStore.getState().setPlanFilters({ planType: 'PPO' });
      useAppStore.getState().setPlanFilters({ metalLevel: 'Gold' });
      const { planFilters } = useAppStore.getState();
      expect(planFilters.planType).toBe('PPO');
      expect(planFilters.metalLevel).toBe('Gold');
    });

    it('overwrites an existing filter value', () => {
      useAppStore.getState().setPlanFilters({ planYear: 2025 });
      useAppStore.getState().setPlanFilters({ planYear: 2026 });
      expect(useAppStore.getState().planFilters.planYear).toBe(2026);
    });

    it('can set multiple filters at once', () => {
      useAppStore.getState().setPlanFilters({ planType: 'EPO', marketType: 'Individual' });
      const { planFilters } = useAppStore.getState();
      expect(planFilters.planType).toBe('EPO');
      expect(planFilters.marketType).toBe('Individual');
    });
  });

  describe('clearPlanFilters', () => {
    it('resets all filters to defaults', () => {
      useAppStore.getState().setPlanFilters({
        planType: 'PPO',
        marketType: 'Individual',
        metalLevel: 'Silver',
        planYear: 2026,
      });
      useAppStore.getState().clearPlanFilters();
      const { planFilters } = useAppStore.getState();
      expect(planFilters.planType).toBeNull();
      expect(planFilters.marketType).toBeNull();
      expect(planFilters.metalLevel).toBeNull();
      expect(planFilters.planYear).toBeNull();
    });
  });

  describe('setIsOnline', () => {
    it('sets online status to false', () => {
      useAppStore.getState().setIsOnline(false);
      expect(useAppStore.getState().isOnline).toBe(false);
    });

    it('sets online status back to true', () => {
      useAppStore.getState().setIsOnline(false);
      useAppStore.getState().setIsOnline(true);
      expect(useAppStore.getState().isOnline).toBe(true);
    });
  });

  describe('persistence configuration', () => {
    it('uses the correct persistence key', () => {
      const persistOptions = (useAppStore as any).persist;
      expect(persistOptions.getOptions().name).toBe('@planscanrx/app-store');
    });
  });
});

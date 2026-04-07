import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { USState } from '../types/auth';

type PlanFilters = {
  planType: string | null;
  marketType: string | null;
  metalLevel: string | null;
  planYear: number | null;
};

const defaultFilters: PlanFilters = {
  planType: null,
  marketType: null,
  metalLevel: null,
  planYear: null,
};

type AppStore = {
  // Selected state (persistent)
  selectedState: USState | null;
  setSelectedState: (state: USState) => void;

  // Plan filters (session only)
  planFilters: PlanFilters;
  setPlanFilters: (filters: Partial<PlanFilters>) => void;
  clearPlanFilters: () => void;

  // Network status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      selectedState: null,
      setSelectedState: (state) => set({ selectedState: state }),

      planFilters: defaultFilters,
      setPlanFilters: (filters) =>
        set((s) => ({ planFilters: { ...s.planFilters, ...filters } })),
      clearPlanFilters: () => set({ planFilters: defaultFilters }),

      isOnline: true,
      setIsOnline: (online) => set({ isOnline: online }),
    }),
    {
      name: '@planscanrx/app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedState: state.selectedState,
      }),
    },
  ),
);

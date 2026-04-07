import type { Insurer } from '../types/domain';

// Auth stack (pre-login)
export type AuthStackParamList = {
  Splash: undefined;
  AuthLanding: undefined;
};

// Main tab navigator
export type MainTabParamList = {
  DiscoverTab: undefined;
  SearchTab: undefined;
  HomeTab: undefined;
  InsightsTab: undefined;
  SettingsTab: undefined;
};

// Search funnel stack
export type SearchStackParamList = {
  InsurerSelection: undefined;
  PlanSelection: { selectedInsurers: Insurer[] };
  DrugSearch: { planIds: number[]; mode: 'single' | 'multi' };
  CoverageResult: { planId: number; drugId: number };
  CoverageComparison: { planIds: number[]; drugId: number };
  PriorAuthDetail: { entryId: number; drugName: string; planName: string };
  StepTherapyDetail: { entryId: number; drugName: string; planName: string };
  QuantityLimitDetail: { entryId: number; drugName: string; planName: string; quantityLimitDetail: string | null };
  DrugAlternatives: { drugId: number; planId?: number; drugName: string };
};

// Saved tab stack
export type SavedStackParamList = {
  SavedLookups: undefined;
  SavedLookupDetail: { lookupId: number };
};

// History tab stack
export type HistoryStackParamList = {
  SearchHistory: undefined;
};

// Settings tab stack
export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  AboutLegal: undefined;
};

import type { Insurer } from '../types/domain';

// Auth stack (pre-login)
export type AuthStackParamList = {
  Splash: undefined;
  AuthLanding: undefined;
};

// Main tab navigator (3 visible tabs + hidden Settings)
export type MainTabParamList = {
  DiscoverTab: undefined;
  HomeTab: undefined;
  InsightsTab: undefined;
  SettingsTab: undefined; // hidden from tab bar, accessed via gear icon on Home
};

// Home stack — home screen + full search flow
export type HomeStackParamList = {
  Home: undefined;
  InsurerSelection: undefined;
  PlanSelection: { insurer: Insurer };
  DrugSearch: { planId: number; planName: string };
  CoverageResult: { planId: number; drugId: number };
  CoverageComparison: { planIds: number[]; drugId: number };
  PriorAuthDetail: { entryId: number; drugName: string; planName: string };
  StepTherapyDetail: { entryId: number; drugName: string; planName: string };
  QuantityLimitDetail: { entryId: number; drugName: string; planName: string; quantityLimitDetail: string | null };
  DrugAlternatives: { drugId: number; planId?: number; drugName: string };
  DrugFirstSearch: undefined;
};

// Search funnel stack — kept for type compatibility
export type SearchStackParamList = Omit<HomeStackParamList, 'Home'>;

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
  Notifications: undefined;
  DataRetention: undefined;
  AboutLegal: undefined;
};

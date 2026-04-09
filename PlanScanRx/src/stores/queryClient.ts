import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
    },
  },
});

export const queryKeys = {
  insurers: {
    all: ['insurers'] as const,
    byState: (stateCode: string) => ['insurers', 'byState', stateCode] as const,
  },
  plans: {
    all: ['plans'] as const,
    byInsurer: (insurerId: number, stateCode: string) =>
      ['plans', 'byInsurer', insurerId, stateCode] as const,
    detail: (planId: number) => ['plans', 'detail', planId] as const,
  },
  drugs: {
    search: (query: string) => ['drugs', 'search', query] as const,
    detail: (drugId: number) => ['drugs', 'detail', drugId] as const,
    alternatives: (drugId: number, planId?: number) =>
      ['drugs', 'alternatives', drugId, planId ?? 'all'] as const,
  },
  priorAuth: {
    criteria: (entryId: number) => ['priorAuth', 'criteria', entryId] as const,
  },
  coverage: {
    single: (planId: number, drugId: number) =>
      ['coverage', 'single', planId, drugId] as const,
    multi: (insurerId: number, stateCode: string, drugId: number) =>
      ['coverage', 'multi', insurerId, stateCode, drugId] as const,
  },
  savedLookups: {
    all: ['savedLookups'] as const,
    detail: (lookupId: number) => ['savedLookups', 'detail', lookupId] as const,
  },
  searchHistory: {
    all: ['searchHistory'] as const,
  },
  articles: {
    all: ['articles'] as const,
  },
  insights: {
    summary: () => ['insights', 'summary'] as const,
    trends: () => ['insights', 'trends'] as const,
  },
} as const;

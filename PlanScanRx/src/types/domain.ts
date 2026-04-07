// Core domain types matching the backend schema from Formulary_concept.md

export type Drug = {
  drugId: number;
  rxcui: string;
  drugName: string;
  genericName: string | null;
  brandNames: string[];
  doseForm: string | null;
  strength: string | null;
  route: string | null;
  drugClass: string | null;
  isSpecialty: boolean;
  isControlled: boolean;
  deaSchedule: string | null;
};

export type Insurer = {
  insurerId: number;
  insurerName: string;
  parentCompany: string | null;
  hiosIssuerId: string | null;
  fhirEndpointUrl: string | null;
  websiteUrl: string | null;
  planCount?: number;
};

export type Plan = {
  planId: number;
  insurerId: number;
  stateCode: string;
  planName: string;
  planType: string | null;
  marketType: string | null;
  metalLevel: string | null;
  planYear: number;
  isActive: boolean;
};

export type FormularyEntry = {
  entryId: number;
  planId: number;
  drugId: number;
  isCovered: boolean;
  tierLevel: number | null;
  tierName: string | null;
  priorAuthRequired: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
  quantityLimitDetail: string | null;
  specialtyDrug: boolean;
  copayAmount: number | null;
  coinsurancePct: number | null;
  copayMailOrder: number | null;
  sourceType: string;
  sourceDate: string;
};

export type PriorAuthCriteria = {
  criteriaId: number;
  entryId: number;
  criteriaType: string;
  criteriaDescription: string | null;
  requiredDiagnoses: string[] | null;
  ageMin: number | null;
  ageMax: number | null;
  genderRestriction: string | null;
  stepTherapyDrugs: string[] | null;
  stepTherapyDescription: string | null;
  maxQuantity: number | null;
  quantityPeriodDays: number | null;
  sourceDocumentUrl: string | null;
};

export type DrugAlternative = {
  alternativeId: number;
  drugId: number;
  alternativeDrugId: number;
  relationshipType: 'GENERIC_EQUIVALENT' | 'THERAPEUTIC_ALTERNATIVE' | 'BIOSIMILAR';
  source: string | null;
  notes: string | null;
  alternativeDrug?: Drug;
};

export type SavedLookup = {
  lookupId: number;
  physicianId: number;
  planId: number;
  drugId: number;
  nickname: string | null;
  createdAt: string;
  plan?: Plan;
  drug?: Drug;
  currentEntry?: FormularyEntry;
};

export type SearchHistoryEntry = {
  searchId: number;
  stateCode: string | null;
  planId: number | null;
  drugId: number | null;
  searchText: string | null;
  resultsCount: number | null;
  searchedAt: string;
  plan?: Plan;
  drug?: Drug;
};

export type PlanFilters = {
  planType: string | null;
  marketType: string | null;
  metalLevel: string | null;
  planYear: number | null;
};

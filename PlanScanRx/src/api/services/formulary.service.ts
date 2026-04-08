import { apiClient } from '../client';
import type { Insurer, Plan, Drug, FormularyEntry, DrugAlternative, PriorAuthCriteria, Article } from '../../types/domain';

export const formularyService = {
  // Insurers — returned pre-sorted by popularity from backend
  getInsurers: (stateCode: string): Promise<Insurer[]> =>
    apiClient.get(`/states/${stateCode}/insurers`).then((r) => r.data?.data ?? r.data),

  // Plans by insurer (state is optional for national/Medicare plans)
  getPlans: (insurerId: number, stateCode: string): Promise<Plan[]> =>
    apiClient.get(`/insurers/${insurerId}/plans`, { params: stateCode ? { state: stateCode } : {} }).then((r) => r.data?.data ?? r.data),

  // Plan lookup by external IDs
  lookupPlanByMedicareId: (contractId: string, planId: string, segmentId: string): Promise<Plan> =>
    apiClient.get('/plans/lookup/medicare', { params: { contract_id: contractId, plan_id: planId, segment_id: segmentId } }).then((r) => r.data?.data ?? r.data),

  lookupPlanByHiosId: (hiosId: string): Promise<Plan> =>
    apiClient.get('/plans/lookup/hios', { params: { hios_plan_id: hiosId } }).then((r) => r.data?.data ?? r.data),

  lookupPlanByGroupId: (groupId: string): Promise<Plan> =>
    apiClient.get('/plans/lookup/group', { params: { group_id: groupId } }).then((r) => r.data?.data ?? r.data),

  // Drug search
  searchDrugs: (query: string): Promise<Drug[]> =>
    apiClient.get('/drugs/search', { params: { q: query } }).then((r) => r.data?.data ?? r.data),

  // Coverage
  getCoverage: (planId: number, drugId: number): Promise<FormularyEntry> =>
    apiClient.get(`/plans/${planId}/drugs/${drugId}/coverage`).then((r) => r.data?.data ?? r.data),

  getCoverageMulti: (planIds: number[], drugId: number): Promise<FormularyEntry[]> =>
    apiClient.get(`/drugs/${drugId}/coverage`, { params: { plan_ids: planIds.join(',') } }).then((r) => r.data?.data ?? r.data),

  // Alternatives
  getAlternatives: (drugId: number, planId?: number): Promise<DrugAlternative[]> =>
    apiClient.get(`/drugs/${drugId}/alternatives`, { params: planId ? { plan_id: planId } : {} }).then((r) => r.data?.data ?? r.data),

  // Prior auth criteria
  getPriorAuthCriteria: (entryId: number): Promise<PriorAuthCriteria[]> =>
    apiClient.get(`/coverage/${entryId}/prior-auth`).then((r) => r.data?.data ?? r.data),

  // Discover feed
  getArticles: (): Promise<Article[]> =>
    apiClient.get('/discover/articles').then((r) => r.data?.data ?? r.data),
};

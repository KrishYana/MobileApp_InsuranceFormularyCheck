import { useMutation } from '@tanstack/react-query';
import { formularyService } from '../../api/services/formulary.service';
import type { Plan } from '../../types/domain';

export function useMedicareLookup() {
  return useMutation<Plan, Error, { contractId: string; planId: string; segmentId: string }>({
    mutationFn: ({ contractId, planId, segmentId }) =>
      formularyService.lookupPlanByMedicareId(contractId, planId, segmentId),
  });
}

export function useHiosLookup() {
  return useMutation<Plan, Error, { hiosId: string }>({
    mutationFn: ({ hiosId }) => formularyService.lookupPlanByHiosId(hiosId),
  });
}

export function useGroupLookup() {
  return useMutation<Plan, Error, { groupId: string; planId?: string }>({
    mutationFn: ({ groupId, planId }) => formularyService.lookupPlanByGroupId(groupId, planId),
  });
}

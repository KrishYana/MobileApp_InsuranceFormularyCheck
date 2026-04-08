import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function usePlans(insurerId: number | null, stateCode: string | null) {
  return useQuery({
    queryKey: queryKeys.plans.byInsurer(insurerId!, stateCode ?? 'national'),
    queryFn: () => formularyService.getPlans(insurerId!, stateCode ?? ''),
    enabled: !!insurerId,
  });
}

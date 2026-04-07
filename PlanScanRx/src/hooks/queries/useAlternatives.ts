import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function useAlternatives(drugId: number, planId?: number) {
  return useQuery({
    queryKey: queryKeys.drugs.alternatives(drugId, planId),
    queryFn: () => formularyService.getAlternatives(drugId, planId),
    enabled: drugId > 0,
  });
}

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function useCoverage(planId: number, drugId: number) {
  return useQuery({
    queryKey: queryKeys.coverage.single(planId, drugId),
    queryFn: () => formularyService.getCoverage(planId, drugId),
  });
}

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function useCoverageMulti(planIds: number[], drugId: number) {
  return useQuery({
    queryKey: ['coverage', 'multi', planIds.sort().join(','), drugId] as const,
    queryFn: () => formularyService.getCoverageMulti(planIds, drugId),
    enabled: planIds.length > 0 && drugId > 0,
  });
}

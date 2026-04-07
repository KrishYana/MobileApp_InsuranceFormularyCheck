import { useQueries } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';
import type { DrugAlternative } from '../../types/domain';

export function useAlternativeCoverage(
  alternatives: DrugAlternative[],
  planId: number | undefined,
) {
  return useQueries({
    queries: alternatives.map((alt) => ({
      queryKey: queryKeys.coverage.single(planId ?? 0, alt.alternativeDrugId),
      queryFn: () => formularyService.getCoverage(planId!, alt.alternativeDrugId),
      enabled: !!planId && planId > 0,
    })),
  });
}

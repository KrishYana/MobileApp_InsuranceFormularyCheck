import { useQuery } from '@tanstack/react-query';
import { formularyService } from '../../api/services/formulary.service';
import { queryKeys } from '../../stores/queryClient';

export function useInsightsSummary() {
  return useQuery({
    queryKey: queryKeys.insights.summary(),
    queryFn: () => formularyService.getInsightsSummary(),
    staleTime: 10 * 60 * 1000, // 10 minutes — insights don't change frequently
  });
}

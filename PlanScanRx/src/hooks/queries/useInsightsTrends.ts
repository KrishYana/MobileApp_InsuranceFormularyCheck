import { useQuery } from '@tanstack/react-query';
import { formularyService } from '../../api/services/formulary.service';
import { queryKeys } from '../../stores/queryClient';

export function useInsightsTrends() {
  return useQuery({
    queryKey: queryKeys.insights.trends(),
    queryFn: () => formularyService.getInsightsTrends(),
    staleTime: 10 * 60 * 1000, // 10 minutes — trends don't change frequently
  });
}

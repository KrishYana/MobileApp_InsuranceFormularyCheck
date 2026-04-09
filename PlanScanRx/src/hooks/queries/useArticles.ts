import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function useArticles() {
  return useQuery({
    queryKey: queryKeys.articles.all,
    queryFn: () => formularyService.getArticles(),
    staleTime: 15 * 60 * 1000, // 15 minutes — feed doesn't change often
  });
}

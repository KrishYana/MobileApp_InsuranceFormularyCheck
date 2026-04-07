import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function useDrugSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.drugs.search(query),
    queryFn: () => formularyService.searchDrugs(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30s — shorter for search results
  });
}

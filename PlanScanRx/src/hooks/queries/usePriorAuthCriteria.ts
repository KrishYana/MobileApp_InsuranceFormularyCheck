import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function usePriorAuthCriteria(entryId: number) {
  return useQuery({
    queryKey: queryKeys.priorAuth.criteria(entryId),
    queryFn: () => formularyService.getPriorAuthCriteria(entryId),
    enabled: entryId > 0,
  });
}

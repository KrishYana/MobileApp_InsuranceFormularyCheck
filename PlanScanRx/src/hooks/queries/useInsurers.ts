import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function useInsurers(stateCode: string | null) {
  return useQuery({
    queryKey: queryKeys.insurers.byState(stateCode!),
    queryFn: () => formularyService.getInsurers(stateCode!),
    enabled: !!stateCode,
  });
}

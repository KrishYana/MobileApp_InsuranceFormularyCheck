import { useQuery } from '@tanstack/react-query';
import type { StateSectionedInsurers } from '../../types/domain';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';

export function useInsurers(stateCode: string | null) {
  return useQuery<StateSectionedInsurers>({
    queryKey: queryKeys.insurers.byState(stateCode!),
    queryFn: () => formularyService.getInsurers(stateCode!),
    enabled: !!stateCode,
  });
}

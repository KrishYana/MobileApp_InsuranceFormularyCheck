import { renderHook, waitFor } from '@testing-library/react-native';
import { useCoverage } from '../useCoverage';
import { createWrapper } from './testQueryWrapper';

jest.mock('../../../api/services/formulary.service', () => ({
  formularyService: {
    getCoverage: jest.fn(),
  },
}));

const { formularyService } = require('../../../api/services/formulary.service');

const mockEntry = {
  entryId: 1,
  planId: 10,
  drugId: 20,
  isCovered: true,
  tierLevel: 2,
  tierName: 'Preferred Brand',
  priorAuthRequired: false,
  stepTherapy: false,
  quantityLimit: false,
  quantityLimitDetail: null,
  specialtyDrug: false,
  copayAmount: 25,
  coinsurancePct: null,
  copayMailOrder: 20,
  sourceType: 'CMS',
  sourceDate: '2026-03-01',
};

describe('useCoverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getCoverage with planId and drugId', async () => {
    formularyService.getCoverage.mockResolvedValue(mockEntry);

    const { result } = renderHook(() => useCoverage(10, 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(formularyService.getCoverage).toHaveBeenCalledWith(10, 20);
  });

  it('returns the formulary entry data on success', async () => {
    formularyService.getCoverage.mockResolvedValue(mockEntry);

    const { result } = renderHook(() => useCoverage(10, 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockEntry);
    expect(result.current.data?.isCovered).toBe(true);
    expect(result.current.data?.tierLevel).toBe(2);
  });

  it('handles error responses', async () => {
    formularyService.getCoverage.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useCoverage(10, 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('fetches immediately (no enabled guard)', async () => {
    formularyService.getCoverage.mockResolvedValue(mockEntry);

    renderHook(() => useCoverage(1, 1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(formularyService.getCoverage).toHaveBeenCalled());
    expect(formularyService.getCoverage).toHaveBeenCalledTimes(1);
  });
});

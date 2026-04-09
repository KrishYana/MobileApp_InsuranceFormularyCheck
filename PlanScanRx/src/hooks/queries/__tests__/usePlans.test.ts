import { renderHook, waitFor } from '@testing-library/react-native';
import { usePlans } from '../usePlans';
import { createWrapper } from './testQueryWrapper';

jest.mock('../../../api/services/formulary.service', () => ({
  formularyService: {
    getPlans: jest.fn(),
  },
}));

const { formularyService } = require('../../../api/services/formulary.service');

const mockPlans = [
  {
    planId: 1,
    insurerId: 10,
    stateCode: 'CA',
    planName: 'Gold PPO 1000',
    planType: 'PPO',
    marketType: 'Individual',
    metalLevel: 'Gold',
    planYear: 2026,
    isActive: true,
  },
  {
    planId: 2,
    insurerId: 10,
    stateCode: 'CA',
    planName: 'Silver HMO 2000',
    planType: 'HMO',
    marketType: 'Individual',
    metalLevel: 'Silver',
    planYear: 2026,
    isActive: true,
  },
];

describe('usePlans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fetch when insurerId is null', () => {
    renderHook(() => usePlans(null, 'CA'), {
      wrapper: createWrapper(),
    });
    expect(formularyService.getPlans).not.toHaveBeenCalled();
  });

  it('fetches plans when insurerId is provided', async () => {
    formularyService.getPlans.mockResolvedValue(mockPlans);

    const { result } = renderHook(() => usePlans(10, 'CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(formularyService.getPlans).toHaveBeenCalledWith(10, 'CA');
  });

  it('returns plan data on success', async () => {
    formularyService.getPlans.mockResolvedValue(mockPlans);

    const { result } = renderHook(() => usePlans(10, 'CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPlans);
    expect(result.current.data).toHaveLength(2);
  });

  it('passes empty string when stateCode is null', async () => {
    formularyService.getPlans.mockResolvedValue([]);

    renderHook(() => usePlans(10, null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(formularyService.getPlans).toHaveBeenCalled());
    expect(formularyService.getPlans).toHaveBeenCalledWith(10, '');
  });

  it('handles errors', async () => {
    formularyService.getPlans.mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => usePlans(10, 'CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

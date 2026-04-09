import { renderHook, waitFor } from '@testing-library/react-native';
import { useInsurers } from '../useInsurers';
import { createWrapper } from './testQueryWrapper';

jest.mock('../../../api/services/formulary.service', () => ({
  formularyService: {
    getInsurers: jest.fn(),
  },
}));

const { formularyService } = require('../../../api/services/formulary.service');

describe('useInsurers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fetch when stateCode is null', () => {
    renderHook(() => useInsurers(null), { wrapper: createWrapper() });
    expect(formularyService.getInsurers).not.toHaveBeenCalled();
  });

  it('fetches insurers when stateCode is provided', async () => {
    const mockInsurers = [
      { insurerId: 1, insurerName: 'Aetna', parentCompany: null, hiosIssuerId: null, fhirEndpointUrl: null, websiteUrl: null },
      { insurerId: 2, insurerName: 'Cigna', parentCompany: null, hiosIssuerId: null, fhirEndpointUrl: null, websiteUrl: null },
    ];
    formularyService.getInsurers.mockResolvedValue(mockInsurers);

    const { result } = renderHook(() => useInsurers('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(formularyService.getInsurers).toHaveBeenCalledWith('CA');
    expect(result.current.data).toEqual(mockInsurers);
  });

  it('passes the stateCode to the service function', async () => {
    formularyService.getInsurers.mockResolvedValue([]);

    renderHook(() => useInsurers('NY'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(formularyService.getInsurers).toHaveBeenCalled());
    expect(formularyService.getInsurers).toHaveBeenCalledWith('NY');
  });

  it('handles API errors', async () => {
    formularyService.getInsurers.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useInsurers('TX'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

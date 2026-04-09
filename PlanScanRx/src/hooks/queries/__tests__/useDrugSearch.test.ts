import { renderHook, waitFor } from '@testing-library/react-native';
import { useDrugSearch } from '../useDrugSearch';
import { createWrapper } from './testQueryWrapper';

jest.mock('../../../api/services/formulary.service', () => ({
  formularyService: {
    searchDrugs: jest.fn(),
  },
}));

const { formularyService } = require('../../../api/services/formulary.service');

const mockDrugs = [
  {
    drugId: 1,
    rxcui: '123456',
    drugName: 'Metformin HCl',
    genericName: 'metformin',
    brandNames: ['Glucophage'],
    doseForm: 'tablet',
    strength: '500mg',
    route: 'oral',
    drugClass: 'Biguanides',
    isSpecialty: false,
    isControlled: false,
    deaSchedule: null,
  },
];

describe('useDrugSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not search when query is less than 2 characters', () => {
    renderHook(() => useDrugSearch('m'), {
      wrapper: createWrapper(),
    });
    expect(formularyService.searchDrugs).not.toHaveBeenCalled();
  });

  it('does not search with empty string', () => {
    renderHook(() => useDrugSearch(''), {
      wrapper: createWrapper(),
    });
    expect(formularyService.searchDrugs).not.toHaveBeenCalled();
  });

  it('does not search with single character', () => {
    renderHook(() => useDrugSearch('a'), {
      wrapper: createWrapper(),
    });
    expect(formularyService.searchDrugs).not.toHaveBeenCalled();
  });

  it('searches when query is 2+ characters', async () => {
    formularyService.searchDrugs.mockResolvedValue(mockDrugs);

    const { result } = renderHook(() => useDrugSearch('me'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(formularyService.searchDrugs).toHaveBeenCalledWith('me');
  });

  it('returns drug results on success', async () => {
    formularyService.searchDrugs.mockResolvedValue(mockDrugs);

    const { result } = renderHook(() => useDrugSearch('metformin'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDrugs);
    expect(result.current.data?.[0].drugName).toBe('Metformin HCl');
  });

  it('handles API errors', async () => {
    formularyService.searchDrugs.mockRejectedValue(new Error('Search failed'));

    const { result } = renderHook(() => useDrugSearch('atorvastatin'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('passes exact query string to the service', async () => {
    formularyService.searchDrugs.mockResolvedValue([]);

    renderHook(() => useDrugSearch('lipitor'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(formularyService.searchDrugs).toHaveBeenCalled());
    expect(formularyService.searchDrugs).toHaveBeenCalledWith('lipitor');
  });
});

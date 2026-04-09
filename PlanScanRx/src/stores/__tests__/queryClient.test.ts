import { queryClient, queryKeys } from '../queryClient';

describe('queryClient configuration', () => {
  it('has staleTime of 5 minutes', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(5 * 60 * 1000);
  });

  it('has gcTime of 24 hours', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.gcTime).toBe(24 * 60 * 60 * 1000);
  });

  it('has retry set to 2 for queries', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(2);
  });

  it('has retry set to 1 for mutations', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.mutations?.retry).toBe(1);
  });

  it('uses offlineFirst network mode', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.networkMode).toBe('offlineFirst');
  });
});

describe('queryKeys', () => {
  describe('insurers', () => {
    it('generates correct "all" key', () => {
      expect(queryKeys.insurers.all).toEqual(['insurers']);
    });

    it('generates correct byState key', () => {
      expect(queryKeys.insurers.byState('CA')).toEqual(['insurers', 'byState', 'CA']);
    });

    it('generates unique keys for different states', () => {
      expect(queryKeys.insurers.byState('CA')).not.toEqual(
        queryKeys.insurers.byState('NY'),
      );
    });
  });

  describe('plans', () => {
    it('generates correct "all" key', () => {
      expect(queryKeys.plans.all).toEqual(['plans']);
    });

    it('generates correct byInsurer key', () => {
      expect(queryKeys.plans.byInsurer(1, 'CA')).toEqual(['plans', 'byInsurer', 1, 'CA']);
    });

    it('generates correct detail key', () => {
      expect(queryKeys.plans.detail(42)).toEqual(['plans', 'detail', 42]);
    });
  });

  describe('drugs', () => {
    it('generates correct search key', () => {
      expect(queryKeys.drugs.search('metformin')).toEqual(['drugs', 'search', 'metformin']);
    });

    it('generates correct detail key', () => {
      expect(queryKeys.drugs.detail(10)).toEqual(['drugs', 'detail', 10]);
    });

    it('generates correct alternatives key with planId', () => {
      expect(queryKeys.drugs.alternatives(10, 5)).toEqual(['drugs', 'alternatives', 10, 5]);
    });

    it('generates correct alternatives key without planId', () => {
      expect(queryKeys.drugs.alternatives(10)).toEqual(['drugs', 'alternatives', 10, 'all']);
    });
  });

  describe('priorAuth', () => {
    it('generates correct criteria key', () => {
      expect(queryKeys.priorAuth.criteria(100)).toEqual(['priorAuth', 'criteria', 100]);
    });
  });

  describe('coverage', () => {
    it('generates correct single key', () => {
      expect(queryKeys.coverage.single(1, 2)).toEqual(['coverage', 'single', 1, 2]);
    });

    it('generates correct multi key', () => {
      expect(queryKeys.coverage.multi(1, 'CA', 2)).toEqual(['coverage', 'multi', 1, 'CA', 2]);
    });
  });

  describe('savedLookups', () => {
    it('generates correct "all" key', () => {
      expect(queryKeys.savedLookups.all).toEqual(['savedLookups']);
    });

    it('generates correct detail key', () => {
      expect(queryKeys.savedLookups.detail(5)).toEqual(['savedLookups', 'detail', 5]);
    });
  });

  describe('searchHistory', () => {
    it('generates correct "all" key', () => {
      expect(queryKeys.searchHistory.all).toEqual(['searchHistory']);
    });
  });

  describe('articles', () => {
    it('generates correct "all" key', () => {
      expect(queryKeys.articles.all).toEqual(['articles']);
    });
  });

  describe('insights', () => {
    it('generates correct summary key', () => {
      expect(queryKeys.insights.summary()).toEqual(['insights', 'summary']);
    });

    it('generates correct trends key', () => {
      expect(queryKeys.insights.trends()).toEqual(['insights', 'trends']);
    });
  });
});

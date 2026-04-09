import {
  resolveCoverageVariant,
  restrictionCount,
  type CoverageVariant,
  type RestrictionFlags,
} from '../coverageStatusResolver';

const noRestrictions: RestrictionFlags = {
  priorAuth: false,
  stepTherapy: false,
  quantityLimit: false,
  specialtyDrug: false,
  isControlled: false,
  deaSchedule: null,
};

const withPriorAuth: RestrictionFlags = {
  ...noRestrictions,
  priorAuth: true,
};

const withAllRestrictions: RestrictionFlags = {
  priorAuth: true,
  stepTherapy: true,
  quantityLimit: true,
  specialtyDrug: true,
  isControlled: true,
  deaSchedule: 'Schedule II',
};

describe('resolveCoverageVariant', () => {
  it('returns "not_found" when isCovered is null and entry does not exist', () => {
    expect(resolveCoverageVariant(null, false, noRestrictions)).toBe('not_found');
  });

  it('returns "unavailable" when isCovered is null but entry exists', () => {
    expect(resolveCoverageVariant(null, true, noRestrictions)).toBe('unavailable');
  });

  it('returns "not_covered" when isCovered is false', () => {
    expect(resolveCoverageVariant(false, true, noRestrictions)).toBe('not_covered');
  });

  it('returns "not_covered" when isCovered is false even with restrictions', () => {
    expect(resolveCoverageVariant(false, true, withAllRestrictions)).toBe('not_covered');
  });

  it('returns "covered" when isCovered is true with no restrictions', () => {
    expect(resolveCoverageVariant(true, true, noRestrictions)).toBe('covered');
  });

  it('returns "covered_restricted" when isCovered with prior auth', () => {
    expect(resolveCoverageVariant(true, true, withPriorAuth)).toBe('covered_restricted');
  });

  it('returns "covered_restricted" when isCovered with step therapy', () => {
    const flags: RestrictionFlags = { ...noRestrictions, stepTherapy: true };
    expect(resolveCoverageVariant(true, true, flags)).toBe('covered_restricted');
  });

  it('returns "covered_restricted" when isCovered with quantity limit', () => {
    const flags: RestrictionFlags = { ...noRestrictions, quantityLimit: true };
    expect(resolveCoverageVariant(true, true, flags)).toBe('covered_restricted');
  });

  it('returns "covered" when only specialtyDrug is true (not a restriction check)', () => {
    const flags: RestrictionFlags = { ...noRestrictions, specialtyDrug: true };
    expect(resolveCoverageVariant(true, true, flags)).toBe('covered');
  });

  it('returns "covered" when only isControlled is true (not a restriction check)', () => {
    const flags: RestrictionFlags = { ...noRestrictions, isControlled: true, deaSchedule: 'III' };
    expect(resolveCoverageVariant(true, true, flags)).toBe('covered');
  });

  it('returns "covered_restricted" with all three clinical restrictions', () => {
    expect(resolveCoverageVariant(true, true, withAllRestrictions)).toBe('covered_restricted');
  });
});

describe('restrictionCount', () => {
  it('returns 0 when no restrictions are set', () => {
    expect(restrictionCount(noRestrictions)).toBe(0);
  });

  it('returns 1 when only priorAuth is true', () => {
    expect(restrictionCount(withPriorAuth)).toBe(1);
  });

  it('returns 1 when only stepTherapy is true', () => {
    expect(restrictionCount({ ...noRestrictions, stepTherapy: true })).toBe(1);
  });

  it('returns 1 when only quantityLimit is true', () => {
    expect(restrictionCount({ ...noRestrictions, quantityLimit: true })).toBe(1);
  });

  it('returns 2 when two restrictions are set', () => {
    expect(restrictionCount({ ...noRestrictions, priorAuth: true, stepTherapy: true })).toBe(2);
  });

  it('returns 3 when all three restrictions are set', () => {
    expect(restrictionCount(withAllRestrictions)).toBe(3);
  });

  it('does not count specialtyDrug or isControlled as restrictions', () => {
    const flags: RestrictionFlags = {
      priorAuth: false,
      stepTherapy: false,
      quantityLimit: false,
      specialtyDrug: true,
      isControlled: true,
      deaSchedule: 'II',
    };
    expect(restrictionCount(flags)).toBe(0);
  });
});

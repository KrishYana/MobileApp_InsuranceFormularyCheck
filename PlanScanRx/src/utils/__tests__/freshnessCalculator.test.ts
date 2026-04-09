import { calculateFreshness, freshnessLabel, type FreshnessTier } from '../freshnessCalculator';

describe('calculateFreshness', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-08T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "unknown" for null input', () => {
    expect(calculateFreshness(null)).toBe('unknown');
  });

  it('returns "fresh" for dates within 30 days', () => {
    expect(calculateFreshness('2026-04-01T00:00:00Z')).toBe('fresh');
  });

  it('returns "fresh" for today', () => {
    expect(calculateFreshness('2026-04-08T00:00:00Z')).toBe('fresh');
  });

  it('returns "fresh" for exactly 30 days ago', () => {
    expect(calculateFreshness('2026-03-09T12:00:00Z')).toBe('fresh');
  });

  it('returns "aging" for dates between 31 and 90 days ago', () => {
    expect(calculateFreshness('2026-02-15T00:00:00Z')).toBe('aging');
  });

  it('returns "aging" for exactly 90 days ago', () => {
    // 90 days before April 8 is Jan 8
    expect(calculateFreshness('2026-01-08T12:00:00Z')).toBe('aging');
  });

  it('returns "stale" for dates older than 90 days', () => {
    expect(calculateFreshness('2025-12-01T00:00:00Z')).toBe('stale');
  });

  it('returns "stale" for very old dates', () => {
    expect(calculateFreshness('2020-01-01T00:00:00Z')).toBe('stale');
  });

  it('accepts Date objects', () => {
    const recentDate = new Date('2026-04-05T00:00:00Z');
    expect(calculateFreshness(recentDate)).toBe('fresh');
  });

  it('accepts date strings', () => {
    expect(calculateFreshness('2026-04-05T00:00:00Z')).toBe('fresh');
  });
});

describe('freshnessLabel', () => {
  it('returns "Data is current" for fresh tier without days', () => {
    expect(freshnessLabel('fresh')).toBe('Data is current');
  });

  it('returns "Updated X days ago" for fresh tier with days', () => {
    expect(freshnessLabel('fresh', 5)).toBe('Updated 5 days ago');
  });

  it('returns "Data may be aging" for aging tier without days', () => {
    expect(freshnessLabel('aging')).toBe('Data may be aging');
  });

  it('returns "Data from X days ago" for aging tier with days', () => {
    expect(freshnessLabel('aging', 60)).toBe('Data from 60 days ago');
  });

  it('returns stale warning regardless of daysSince', () => {
    expect(freshnessLabel('stale')).toBe('Data may be outdated. Verify with the plan.');
    expect(freshnessLabel('stale', 120)).toBe('Data may be outdated. Verify with the plan.');
  });

  it('returns unknown message regardless of daysSince', () => {
    expect(freshnessLabel('unknown')).toBe('Data freshness unknown');
    expect(freshnessLabel('unknown', 0)).toBe('Data freshness unknown');
  });

  it('handles fresh with 0 days', () => {
    expect(freshnessLabel('fresh', 0)).toBe('Updated 0 days ago');
  });
});

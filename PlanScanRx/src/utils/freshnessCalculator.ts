export type FreshnessTier = 'fresh' | 'aging' | 'stale' | 'unknown';

export function calculateFreshness(sourceDate: string | Date | null): FreshnessTier {
  if (!sourceDate) return 'unknown';

  const date = typeof sourceDate === 'string' ? new Date(sourceDate) : sourceDate;
  const daysSince = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSince <= 30) return 'fresh';
  if (daysSince <= 90) return 'aging';
  return 'stale';
}

export function freshnessLabel(tier: FreshnessTier, daysSince?: number): string {
  switch (tier) {
    case 'fresh':
      return daysSince != null ? `Updated ${daysSince} days ago` : 'Data is current';
    case 'aging':
      return daysSince != null ? `Data from ${daysSince} days ago` : 'Data may be aging';
    case 'stale':
      return 'Data may be outdated. Verify with the plan.';
    case 'unknown':
      return 'Data freshness unknown';
  }
}

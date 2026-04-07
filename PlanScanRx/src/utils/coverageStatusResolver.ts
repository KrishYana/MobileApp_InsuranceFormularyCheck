export type CoverageVariant =
  | 'covered'
  | 'covered_restricted'
  | 'not_covered'
  | 'not_found'
  | 'unavailable'
  | 'error';

export type RestrictionFlags = {
  priorAuth: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
  specialtyDrug: boolean;
  isControlled: boolean;
  deaSchedule: string | null;
};

export function resolveCoverageVariant(
  isCovered: boolean | null,
  entryExists: boolean,
  restrictions: RestrictionFlags,
): CoverageVariant {
  if (isCovered === null && !entryExists) return 'not_found';
  if (isCovered === null) return 'unavailable';
  if (!isCovered) return 'not_covered';

  const hasRestriction =
    restrictions.priorAuth ||
    restrictions.stepTherapy ||
    restrictions.quantityLimit;

  return hasRestriction ? 'covered_restricted' : 'covered';
}

export function restrictionCount(flags: RestrictionFlags): number {
  let count = 0;
  if (flags.priorAuth) count++;
  if (flags.stepTherapy) count++;
  if (flags.quantityLimit) count++;
  return count;
}

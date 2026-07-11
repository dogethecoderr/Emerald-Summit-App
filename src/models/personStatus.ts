/**
 * A person's summit-readiness status. "checkedIn" implies "validated" has
 * already happened (you can't check in before your forms are validated),
 * so this is modeled as one enum rather than two independent booleans.
 *
 * PLACEHOLDER: not yet backed by a `public.users` column — display-only
 * for this pass. Wire to a real field once the validation/check-in flow
 * is designed.
 */
export type PersonStatus = 'none' | 'validated' | 'checkedIn';

export function personStatusLabel(status: PersonStatus): string {
  switch (status) {
    case 'checkedIn':
      return 'Checked In';
    case 'validated':
      return 'Validated';
    default:
      return 'Not Yet Validated';
  }
}

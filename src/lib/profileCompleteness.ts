import type { Client } from '../types/client';

/**
 * The 7 fields that contribute to profile completeness. Each fills ~14.29%
 * so we round to the nearest 5% for display (users don't care about decimals,
 * they care about the needle moving in discrete chunks).
 */
export const COMPLETENESS_FIELDS = [
  'first_name',
  'last_name',
  'person_type',
  'client_type_id',
  'email',
  'phone',
  'address',
] as const satisfies readonly (keyof Client)[];

export interface Completeness {
  /** Rounded to nearest 5% for a clean gauge read-out. */
  percent: number;
  filled: number;
  total: number;
  missing: readonly (keyof Client)[];
}

export function computeCompleteness(client: Client | undefined | null): Completeness {
  const total = COMPLETENESS_FIELDS.length;
  if (!client) return { percent: 0, filled: 0, total, missing: COMPLETENESS_FIELDS };

  const missing = COMPLETENESS_FIELDS.filter((field) => {
    const value = client[field];
    return value === null || value === undefined || String(value).trim() === '';
  });
  const filled = total - missing.length;
  const raw = (filled / total) * 100;
  const percent = Math.round(raw / 5) * 5;
  return { percent, filled, total, missing };
}

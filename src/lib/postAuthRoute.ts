import type { Href } from 'expo-router';
import type { AccountType } from '../types/auth';
import type { FlowChoice } from './flowChoice';

/**
 * Where to send the user after a successful login / registration.
 *
 * Rules:
 *   - STAFF  → admin tabs.
 *   - CLIENT → client tabs (profile).
 *   - BOTH   → if they've picked a flow before, resume it; otherwise land on
 *              `/flow-choice` to make the pick. AuthContext auto-persists the
 *              single-account types, so by the time this runs `flowChoice` is
 *              already `null` only for unresolved BOTH users.
 */
export function getPostAuthRoute(
  accountType: AccountType | null,
  flowChoice: FlowChoice | null,
): Href {
  if (accountType === 'CLIENT') return '/(client)/(tabs)/profile';
  if (accountType === 'STAFF') return '/(app)/(tabs)/in-transit';
  if (accountType === 'BOTH') {
    if (flowChoice === 'client') return '/(client)/(tabs)/profile';
    if (flowChoice === 'admin') return '/(app)/(tabs)/in-transit';
    return '/flow-choice';
  }
  // Fallback: unknown account type → default to admin.
  return '/(app)/(tabs)/in-transit';
}

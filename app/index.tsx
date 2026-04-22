import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { getPostAuthRoute } from '../src/lib/postAuthRoute';
import { LoadingScreen } from '../src/components/ui/LoadingScreen';

/**
 * Root router. Branches by auth state and account type:
 *
 *   - Not authenticated → /(auth)/login-otp
 *   - STAFF  account    → /(app)/(tabs)/in-transit
 *   - CLIENT account    → /(client)/(tabs)/home (client layout re-gates onboarding)
 *   - BOTH   account    → /flow-choice (once) → then persisted choice
 *
 * The 6-slide onboarding deck is no longer gated here — it's owned by the
 * `(client)/_layout.tsx` guard, which reads `client.onboarding` and shows the
 * deck on the first client-shell entry.
 */
export default function Index() {
  const { isAuthenticated, isLoading, accountType, flowChoice } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login-otp" />;

  return <Redirect href={getPostAuthRoute(accountType, flowChoice)} />;
}

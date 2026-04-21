import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useOnboardingSeen } from '../src/hooks/useOnboardingSeen';
import { getPostAuthRoute } from '../src/lib/postAuthRoute';
import { LoadingScreen } from '../src/components/ui/LoadingScreen';

/**
 * Root router. Branches by auth state, onboarding state, and account type:
 *
 *   - Onboarding never seen → /onboarding
 *   - Not authenticated      → /(auth)/register/phone
 *   - STAFF  account         → /(app)/(tabs)/in-transit
 *   - CLIENT account         → /(client)/(tabs)/profile
 *   - BOTH   account         → /flow-choice (once) → then persisted choice
 *
 * Keeping the branching here (instead of inside each auth screen) means every
 * post-login redirect can simply land on `/` and the correct destination is
 * picked from the latest AuthContext state.
 */
export default function Index() {
  const { isAuthenticated, isLoading, accountType, flowChoice } = useAuth();
  const onboardingSeen = useOnboardingSeen();

  if (isLoading || onboardingSeen === null) return <LoadingScreen />;
  if (!onboardingSeen) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/(auth)/register/phone" />;

  return <Redirect href={getPostAuthRoute(accountType, flowChoice)} />;
}

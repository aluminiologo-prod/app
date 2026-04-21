import { Slot, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useMyClient } from '../../src/hooks/queries';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';

/**
 * Mirror of `app/(app)/_layout.tsx` — this is the shell for CLIENT users.
 * Protects the whole `(client)` subtree: unauthenticated users bounce to
 * login-otp, STAFF-only users get pushed into the admin shell, and BOTH-users
 * who haven't picked a flow yet see the flow-choice modal.
 *
 * Additionally, CLIENT users whose `client.onboarding` is still false are
 * sent through the 6-slide deck at `/onboarding` before they reach the tabs.
 * The deck flips the flag via `useMarkMyOnboardingComplete`, which updates
 * the myClient cache and lets this guard fall through to <Slot /> on re-render.
 */
export default function ClientLayout() {
  const { isAuthenticated, isLoading, accountType, flowChoice } = useAuth();
  const { data: client, isLoading: clientLoading } = useMyClient({
    enabled: isAuthenticated,
  });

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login-otp" />;

  if (accountType === 'STAFF') return <Redirect href="/(app)/(tabs)/in-transit" />;
  if (accountType === 'BOTH' && flowChoice === 'admin') {
    return <Redirect href="/(app)/(tabs)/in-transit" />;
  }
  if (accountType === 'BOTH' && flowChoice === null) {
    return <Redirect href="/flow-choice" />;
  }

  // Wait for the client record before deciding onboarding. We only do this for
  // users that already passed the flow-choice / account-type checks above.
  if (clientLoading || !client) return <LoadingScreen />;
  if (!client.onboarding) return <Redirect href="/onboarding" />;

  return <Slot />;
}

import { Slot, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useOnboardingSeen } from '../../src/hooks/useOnboardingSeen';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';

/**
 * Mirror of `app/(app)/_layout.tsx` — this is the shell for CLIENT users.
 * Protects the whole `(client)` subtree: unauthenticated users bounce to the
 * registration flow, STAFF-only users get pushed into the admin shell, and
 * BOTH-users who haven't picked a flow yet see the flow-choice modal.
 */
export default function ClientLayout() {
  const { isAuthenticated, isLoading, accountType, flowChoice } = useAuth();
  const onboardingSeen = useOnboardingSeen();

  if (isLoading || onboardingSeen === null) return <LoadingScreen />;
  if (!isAuthenticated) {
    return (
      <Redirect
        href={onboardingSeen ? '/(auth)/register/phone' : '/onboarding'}
      />
    );
  }

  if (accountType === 'STAFF') return <Redirect href="/(app)/(tabs)/in-transit" />;
  if (accountType === 'BOTH' && flowChoice === 'admin') {
    return <Redirect href="/(app)/(tabs)/in-transit" />;
  }
  if (accountType === 'BOTH' && flowChoice === null) {
    return <Redirect href="/flow-choice" />;
  }

  return <Slot />;
}

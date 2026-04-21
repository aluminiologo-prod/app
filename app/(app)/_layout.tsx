import { Slot, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useOnboardingSeen } from '../../src/hooks/useOnboardingSeen';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';

export default function AppLayout() {
  const { isAuthenticated, isLoading, accountType, flowChoice } = useAuth();
  const onboardingSeen = useOnboardingSeen();

  if (isLoading || onboardingSeen === null) return <LoadingScreen />;
  if (!isAuthenticated) {
    return (
      <Redirect href={onboardingSeen ? '/(auth)/login-otp' : '/onboarding'} />
    );
  }

  // Keep the admin shell reserved for STAFF and BOTH-users who picked admin.
  // Pure CLIENT accounts bounce back to the root router so they land on the
  // client experience — even if someone deep-links into the admin tabs.
  if (accountType === 'CLIENT') return <Redirect href="/(client)/(tabs)/profile" />;
  if (accountType === 'BOTH' && flowChoice === 'client') {
    return <Redirect href="/(client)/(tabs)/profile" />;
  }
  if (accountType === 'BOTH' && flowChoice === null) {
    return <Redirect href="/flow-choice" />;
  }

  return <Slot />;
}

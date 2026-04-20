import { Slot, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useOnboardingSeen } from '../../src/hooks/useOnboardingSeen';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const onboardingSeen = useOnboardingSeen();

  if (isLoading || onboardingSeen === null) return <LoadingScreen />;
  if (!isAuthenticated) {
    return (
      <Redirect
        href={onboardingSeen ? '/(auth)/register/phone' : '/onboarding'}
      />
    );
  }

  return <Slot />;
}

import { Slot, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return <Slot />;
}

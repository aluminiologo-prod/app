import { useEffect } from 'react';
import { Slot, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useMyClient } from '../../src/hooks/queries';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { toastError } from '../../src/lib/toast';

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
  const { isAuthenticated, isLoading, accountType, flowChoice, chooseFlow } =
    useAuth();

  // Only hit `/clients/me` when the user is actually trying to enter the
  // client shell — i.e. a CLIENT account or a BOTH account that picked client.
  // STAFF (or BOTH+admin) accounts would get 403'd by the backend's
  // @CurrentClient guard; we skip the call entirely and let the redirects
  // below push them into the admin shell.
  const isClientFlow =
    isAuthenticated &&
    (accountType === 'CLIENT' ||
      (accountType === 'BOTH' && flowChoice === 'client'));

  const {
    data: client,
    isLoading: clientLoading,
    isError: clientError,
    error,
  } = useMyClient({ enabled: isClientFlow });

  // Data inconsistency: the account is flagged BOTH but the backend has no
  // Client row linked to the profile, so every call to `/clients/me` 403s.
  // Fall back to admin mode instead of looping on a spinner — the user still
  // has staff access and can use the app; this also stops any future log-in
  // from bouncing straight into flow-choice again.
  useEffect(() => {
    if (!clientError) return;
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('client accounts')) {
      toastError(
        'No client record found for this account — switching to admin mode.',
      );
      chooseFlow('admin');
    } else {
      toastError(message);
    }
  }, [clientError, error, chooseFlow]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login-otp" />;

  if (accountType === 'STAFF') return <Redirect href="/(app)/(tabs)/in-transit" />;
  if (accountType === 'BOTH' && flowChoice === 'admin') {
    return <Redirect href="/(app)/(tabs)/in-transit" />;
  }
  if (accountType === 'BOTH' && flowChoice === null) {
    return <Redirect href="/flow-choice" />;
  }

  // Wait for the client record before deciding onboarding. The useEffect above
  // handles the error path, so we only reach this branch while the request is
  // in-flight or has succeeded.
  if (clientLoading || !client) return <LoadingScreen />;
  if (!client.onboarding) return <Redirect href="/onboarding" />;

  return <Slot />;
}

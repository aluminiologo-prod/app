import { useEffect, useState } from 'react';
import { hasSeenOnboarding } from '../lib/onboarding';

/**
 * Reads the persisted onboarding-seen flag on mount. Returns `null` while the
 * value is still being loaded from SecureStore so callers can render a splash
 * placeholder instead of briefly flashing the wrong screen.
 */
export function useOnboardingSeen(): boolean | null {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    hasSeenOnboarding().then((value) => {
      if (!cancelled) setSeen(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return seen;
}

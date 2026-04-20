import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'onboarding_seen_v1';

/**
 * Has the user already completed (or skipped) the welcome slides at least
 * once? We persist the flag in SecureStore so it survives reinstalls within
 * the keychain on iOS; after the user registers and later logs out we still
 * don't want to show them the onboarding again.
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return value === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_KEY, '1');
  } catch {
    /* non-fatal: user will see the onboarding again at most one more time */
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
  } catch {
    /* ignore */
  }
}

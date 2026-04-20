import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_seen_v1';

/**
 * Has the user already completed (or skipped) the welcome slides at least
 * once? We persist this in AsyncStorage (the app's sandboxed Documents
 * directory) so it behaves intuitively:
 *   - Wipes on uninstall → reinstalling the app replays onboarding, which is
 *     what the user expects.
 *   - Not in the Keychain: iOS's Keychain survives uninstalls, so a flag
 *     stored there would never trigger again. Tokens stay in SecureStore
 *     because the Keychain survival is desirable there.
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    /* non-fatal: user will see the onboarding again at most one more time */
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch {
    /* ignore */
  }
}

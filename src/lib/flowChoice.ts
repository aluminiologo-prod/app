import AsyncStorage from '@react-native-async-storage/async-storage';

export type FlowChoice = 'client' | 'admin';

const FLOW_CHOICE_KEY = 'flow_choice_v1';

/**
 * Which flow the user picked on login. Only relevant for accounts with
 * `account_type === 'BOTH'` — STAFF and CLIENT accounts have no choice and
 * don't write this key. Kept in AsyncStorage (not SecureStore) so the flag
 * is wiped on uninstall, matching the onboarding behaviour.
 */
export async function getFlowChoice(): Promise<FlowChoice | null> {
  try {
    const value = await AsyncStorage.getItem(FLOW_CHOICE_KEY);
    return value === 'client' || value === 'admin' ? value : null;
  } catch {
    return null;
  }
}

export async function setFlowChoice(choice: FlowChoice): Promise<void> {
  try {
    await AsyncStorage.setItem(FLOW_CHOICE_KEY, choice);
  } catch {
    /* non-fatal */
  }
}

export async function clearFlowChoice(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FLOW_CHOICE_KEY);
  } catch {
    /* ignore */
  }
}

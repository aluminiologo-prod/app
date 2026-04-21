import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface RegisterTokens {
  access_token: string;
  refresh_token: string;
}

interface RegisterState {
  phone: string;
  firstName: string;
  lastName: string;
  /** UUID of the selected ClientType (fetched at runtime from `/client-types/public`). */
  clientTypeId: string | null;
  authUserId: string | null;
  tokens: RegisterTokens | null;
}

interface RegisterContextValue extends RegisterState {
  setPhone: (phone: string) => void;
  setName: (firstName: string, lastName: string) => void;
  setClientTypeId: (clientTypeId: string | null) => void;
  setVerificationResult: (args: { authUserId: string; tokens: RegisterTokens }) => void;
  reset: () => void;
}

const EMPTY_STATE: RegisterState = {
  phone: '',
  firstName: '',
  lastName: '',
  clientTypeId: null,
  authUserId: null,
  tokens: null,
};

const RegisterContext = createContext<RegisterContextValue | null>(null);

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegisterState>(EMPTY_STATE);

  const setPhone = useCallback((phone: string) => {
    setState((prev) => ({ ...prev, phone }));
  }, []);

  const setName = useCallback((firstName: string, lastName: string) => {
    setState((prev) => ({ ...prev, firstName, lastName }));
  }, []);

  const setClientTypeId = useCallback((clientTypeId: string | null) => {
    setState((prev) => ({ ...prev, clientTypeId }));
  }, []);

  const setVerificationResult = useCallback(
    ({ authUserId, tokens }: { authUserId: string; tokens: RegisterTokens }) => {
      setState((prev) => ({ ...prev, authUserId, tokens }));
    },
    [],
  );

  const reset = useCallback(() => setState(EMPTY_STATE), []);

  const value = useMemo<RegisterContextValue>(
    () => ({
      ...state,
      setPhone,
      setName,
      setClientTypeId,
      setVerificationResult,
      reset,
    }),
    [state, setPhone, setName, setClientTypeId, setVerificationResult, reset],
  );

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export function useRegister() {
  const ctx = useContext(RegisterContext);
  if (!ctx) throw new Error('useRegister must be used within RegisterProvider');
  return ctx;
}

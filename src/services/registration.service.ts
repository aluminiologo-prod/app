import api from '../lib/axios';
import type { LoginResponsePayload } from '../contexts/AuthContext';

export interface VerifyRegistrationOtpResult {
  /** When the phone is already tied to a Client, the backend returns the full login response with this flag. */
  is_existing_user?: boolean;
  /** When the phone is new, the backend returns session tokens plus this flag; caller must continue the wizard. */
  requires_profile?: boolean;

  // Session tokens (always present)
  access_token: string;
  refresh_token: string;
  expires_in?: number;

  // Present only when `is_existing_user` is true (LoginResponse shape)
  account_type?: 'STAFF' | 'CLIENT' | 'BOTH';
  staff?: unknown;
  user?: unknown;
  client?: unknown;

  // Present only when `requires_profile` is true
  auth_user_id?: string;
}

export async function requestRegistrationOtp(phone: string): Promise<{ sent: boolean }> {
  const { data } = await api.post('/auth/register/request-otp', { phone });
  return data;
}

export async function verifyRegistrationOtp(
  phone: string,
  code: string,
): Promise<VerifyRegistrationOtpResult> {
  const { data } = await api.post('/auth/register/verify-otp', { phone, code });
  return data;
}

export async function completeRegistration(args: {
  bearerToken: string;
  refreshToken: string;
  phone: string;
  firstName: string;
  lastName: string;
  clientTypeId: string;
}): Promise<LoginResponsePayload> {
  const { data } = await api.post(
    '/auth/register/complete',
    {
      phone: args.phone,
      first_name: args.firstName,
      last_name: args.lastName,
      client_type_id: args.clientTypeId,
      refresh_token: args.refreshToken,
    },
    { headers: { Authorization: `Bearer ${args.bearerToken}` } },
  );
  return data as LoginResponsePayload;
}

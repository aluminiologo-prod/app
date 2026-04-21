import api from '../lib/axios';
import type { PublicClientType } from '../types/client-type';

/**
 * Public list of active client types used by the mobile registration wizard
 * (step 4). The endpoint is `@Public()` on the backend — the shared axios
 * interceptor attaches a Bearer token only if a session exists, so this is
 * safe to call before the user has authenticated.
 */
export async function getPublicClientTypes(): Promise<PublicClientType[]> {
  const { data } = await api.get('/client-types/public');
  return data;
}

import api from '../lib/axios';
import type {
  Client,
  UpdateAddressPayload,
  UpdateClientTypePayload,
  UpdateEmailPayload,
  UpdateFiscalDocPayload,
  UpdateNamePayload,
  UpdatePersonTypePayload,
} from '../types/client';

export async function getMyClient(): Promise<Client> {
  const { data } = await api.get('/clients/me');
  return data;
}

export async function updateMyName(payload: UpdateNamePayload): Promise<Client> {
  const { data } = await api.patch('/clients/me/name', payload);
  return data;
}

export async function updateMyPersonType(
  payload: UpdatePersonTypePayload,
): Promise<Client> {
  const { data } = await api.patch('/clients/me/person-type', payload);
  return data;
}

export async function updateMyClientType(
  payload: UpdateClientTypePayload,
): Promise<Client> {
  const { data } = await api.patch('/clients/me/client-type', payload);
  return data;
}

export async function updateMyEmail(payload: UpdateEmailPayload): Promise<Client> {
  const { data } = await api.patch('/clients/me/email', payload);
  return data;
}

export async function updateMyFiscalDoc(
  payload: UpdateFiscalDocPayload,
): Promise<Client> {
  const { data } = await api.patch('/clients/me/fiscal-doc', payload);
  return data;
}

export async function updateMyAddress(
  payload: UpdateAddressPayload,
): Promise<Client> {
  const { data } = await api.patch('/clients/me/address', payload);
  return data;
}

/**
 * Called AFTER `supabase.auth.updateUser({ phone })` + `verifyOtp({ type:'phone_change' })`
 * succeeds on the client. The backend reads the verified phone from auth.users
 * server-side so this endpoint takes no body — the client can never forge it.
 */
export async function syncMyPhone(): Promise<Client> {
  const { data } = await api.patch('/clients/me/phone/sync');
  return data;
}

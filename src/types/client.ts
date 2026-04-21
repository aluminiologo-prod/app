import type { PublicClientType } from './client-type';

export type PersonType = 'INDIVIDUAL' | 'BUSINESS';
export type ClientSource = 'SELF_REGISTERED' | 'ADMIN_CREATED';

export interface ClientType extends PublicClientType {
  is_active: boolean;
}

export interface Client {
  id: string;
  client_type_id: string;
  person_type: PersonType;
  business_name: string | null;
  first_name: string | null;
  last_name: string | null;
  rif: string | null;
  email: string | null;
  phone: string | null;
  phone_secondary: string | null;
  address: string | null;
  city: string | null;
  source: ClientSource;
  is_active: boolean;
  is_archived: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client_type: ClientType;
}

export interface UpdateNamePayload {
  first_name: string;
  last_name: string;
}

export interface UpdatePersonTypePayload {
  person_type: PersonType;
}

export interface UpdateClientTypePayload {
  client_type_id: string;
}

export interface UpdateEmailPayload {
  email: string;
}

export interface UpdateFiscalDocPayload {
  rif: string;
}

export interface UpdateAddressPayload {
  address: string;
  city?: string;
}

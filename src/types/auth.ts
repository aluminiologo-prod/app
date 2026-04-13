import type { UserRole } from './role';
import type { Store } from './store';

export type AccountType = 'STAFF' | 'CLIENT' | 'BOTH';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role_id: string | null;
  store_id: string | null;
  store: Pick<Store, 'id' | 'name' | 'code'> | null;
  is_active: boolean;
  role: UserRole | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  account_type: AccountType;
  staff: AuthUser | null;
  client: unknown | null;
  user: AuthUser | null;
}

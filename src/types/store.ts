export type StoreType = 'WAREHOUSE' | 'STORE' | 'ONLINE' | 'TRANSIT';

export interface Store {
  id: string;
  name: string;
  code: string;
  type: StoreType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

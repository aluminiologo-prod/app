import api from '../lib/axios';
import type { Store } from '../types/store';
import type { PaginatedResponse } from '../types/common';

export async function getStores(params?: { limit?: number; is_active?: boolean }): Promise<PaginatedResponse<Store>> {
  const { data } = await api.get('/stores', { params });
  return data;
}

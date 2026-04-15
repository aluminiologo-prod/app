import api from '../lib/axios';
import type { Country } from '../types/country';

export async function listCountries(): Promise<{ items: Country[] }> {
  const { data } = await api.get<{ items: Country[] }>('/countries');
  return data;
}

/**
 * src/hooks/__tests__/queries.test.ts
 *
 * Tests for the query hooks in src/hooks/queries.ts, with emphasis on the
 * post-refactor `toFlagEmoji` guard inside `useCountries`.
 *
 * `toFlagEmoji` is a private helper — its behaviour is observable through
 * the `flag_emoji` field returned by `useCountries`'s `select` transform:
 *
 *   - When the country already has a non-empty flag_emoji it is kept as-is.
 *   - When flag_emoji is falsy AND code is a valid ISO-2 string, it is computed.
 *   - When flag_emoji is falsy AND code is NOT ISO-2 (e.g. "US-CA", "ZZZ", ""),
 *     the guard now returns '' instead of producing garbage Unicode characters.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// useCountries — toFlagEmoji guard
// ---------------------------------------------------------------------------

import { useCountries } from '../queries';

// ---------------------------------------------------------------------------
// Mock the countries service at module level
// ---------------------------------------------------------------------------
const mockListCountries = jest.fn();
jest.mock('../../services/countries.service', () => ({
  listCountries: (...args: unknown[]) => mockListCountries(...args),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

interface RawCountry {
  id: string;
  name: string;
  code: string;
  dial_code: string;
  flag_emoji: string;
  is_active: boolean;
}

function makeRawCountry(overrides: Partial<RawCountry> & Pick<RawCountry, 'code'>): RawCountry {
  return {
    id: overrides.code,
    name: overrides.code,
    dial_code: '+1',
    flag_emoji: '',
    is_active: true,
    ...overrides,
  };
}

// The regional-indicator offset used to build flag emojis
const RI_OFFSET = 0x1f1e6;
function expectedFlag(code: string): string {
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(RI_OFFSET + c.charCodeAt(0) - 65))
    .join('');
}

describe('useCountries — toFlagEmoji guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preserves an existing flag_emoji and does not overwrite it', async () => {
    const country = makeRawCountry({ code: 'VE', flag_emoji: '🇻🇪' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].flag_emoji).toBe('🇻🇪');
  });

  it('computes flag_emoji from a valid ISO-2 code when field is empty', async () => {
    const country = makeRawCountry({ code: 'US', flag_emoji: '' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].flag_emoji).toBe(expectedFlag('US'));
  });

  it('computes flag_emoji for Venezuela (VE) when field is empty', async () => {
    const country = makeRawCountry({ code: 'VE', flag_emoji: '' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].flag_emoji).toBe(expectedFlag('VE'));
  });

  it('returns empty string for a 3-letter code (not ISO-2) instead of garbage chars', async () => {
    // Pre-guard behaviour: "ZZZ" would produce 3 regional-indicator characters.
    // Post-guard behaviour: the regex /^[A-Z]{2}$/ fails → return ''.
    const country = makeRawCountry({ code: 'ZZZ', flag_emoji: '' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].flag_emoji).toBe('');
  });

  it('returns empty string for a sub-region code like "US-CA"', async () => {
    const country = makeRawCountry({ code: 'US-CA', flag_emoji: '' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].flag_emoji).toBe('');
  });

  it('returns empty string for a numeric code', async () => {
    const country = makeRawCountry({ code: '01', flag_emoji: '' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].flag_emoji).toBe('');
  });

  it('returns empty string for an empty code string', async () => {
    const country = makeRawCountry({ code: '', flag_emoji: '' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].flag_emoji).toBe('');
  });

  it('handles mixed list: valid codes get emoji, invalid codes get empty string', async () => {
    const countries = [
      makeRawCountry({ code: 'CO', flag_emoji: '' }),
      makeRawCountry({ code: 'ZZZ', flag_emoji: '' }),
      makeRawCountry({ code: 'BR', flag_emoji: '🇧🇷' }), // already set
    ];
    mockListCountries.mockResolvedValueOnce({ items: countries });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const data = result.current.data!;
    expect(data[0].flag_emoji).toBe(expectedFlag('CO'));
    expect(data[1].flag_emoji).toBe('');
    expect(data[2].flag_emoji).toBe('🇧🇷');
  });

  it('lowercases codes before testing — code "ve" still gets a flag', async () => {
    // The guard normalises: code.trim().toUpperCase() — so "ve" → "VE" passes.
    const country = makeRawCountry({ code: 've', flag_emoji: '' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // After normalisation "ve" → "VE" which is 2 letters → emoji is produced
    expect(result.current.data?.[0].flag_emoji).toBe(expectedFlag('VE'));
  });

  it('trims whitespace in codes — " US " still gets a flag', async () => {
    const country = makeRawCountry({ code: ' US ', flag_emoji: '' });
    mockListCountries.mockResolvedValueOnce({ items: [country] });

    const { result } = renderHook(() => useCountries(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].flag_emoji).toBe(expectedFlag('US'));
  });
});

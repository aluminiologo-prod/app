/**
 * src/hooks/__tests__/useCrudList.test.ts
 *
 * Tests for the useCrudList hook.
 *
 * Strategy: wrap the hook in a QueryClientProvider, drive state changes via
 * act(), and verify the returned values rather than TanStack Query internals.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCrudList } from '../useCrudList';
import type { PaginatedResponse } from '../../types/common';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWrapper(client?: QueryClient) {
  const qc =
    client ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

function makePaginatedResponse<T>(
  items: T[],
  page = 1,
  total = items.length,
): PaginatedResponse<T> {
  return {
    items,
    pagination: {
      page,
      limit: 20,
      total,
      totalPages: Math.ceil(total / 20),
    },
  };
}

interface TestItem {
  id: string;
  name: string;
}

interface TestFilters extends Record<string, unknown> {
  search: string;
  status: string | null;
}

const DEFAULT_FILTERS: TestFilters = { search: '', status: null };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCrudList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ---- initial state ----

  describe('initial state', () => {
    it('starts on page 1', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      expect(result.current.page).toBe(1);
    });

    it('starts with default filters', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    });

    it('starts with empty items list', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      expect(result.current.items).toEqual([]);
    });

    it('starts with total = 0', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      expect(result.current.total).toBe(0);
    });

    it('hasActiveFilters is false when filters match defaults', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  // ---- data loading ----

  describe('data loading', () => {
    it('calls fetchFn with page and limit merged into filters', async () => {
      const items: TestItem[] = [{ id: '1', name: 'A' }];
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse(items));

      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
            limit: 20,
          }),
        { wrapper: makeWrapper() },
      );

      await waitFor(() => expect(result.current.items).toEqual(items));

      expect(fetchFn).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20, ...DEFAULT_FILTERS }),
      );
    });

    it('exposes items from the resolved response', async () => {
      const items: TestItem[] = [
        { id: '1', name: 'Alpha' },
        { id: '2', name: 'Beta' },
      ];
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse(items));

      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.total).toBe(2);
    });
  });

  // ---- setPage ----

  describe('setPage', () => {
    it('updates page state when called', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.setPage(3);
      });

      expect(result.current.page).toBe(3);
    });
  });

  // ---- handleFilterChange ----

  describe('handleFilterChange', () => {
    it('updates non-search filters immediately (0ms debounce)', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.handleFilterChange('status', 'DRAFT');
        jest.runAllTimers();
      });

      expect(result.current.filters.status).toBe('DRAFT');
    });

    it('resets page to 1 when a filter changes', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.setPage(5);
      });

      act(() => {
        result.current.handleFilterChange('status', 'DRAFT');
        jest.runAllTimers();
      });

      expect(result.current.page).toBe(1);
    });

    it('debounces search filter by 400ms', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.handleFilterChange('search', 'TR-00');
      });

      // Before debounce fires
      expect(result.current.filters.search).toBe('');

      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(result.current.filters.search).toBe('TR-00');
    });

    it('cancels earlier debounce when search is updated rapidly', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.handleFilterChange('search', 'T');
        result.current.handleFilterChange('search', 'TR');
        result.current.handleFilterChange('search', 'TR-001');
        jest.advanceTimersByTime(400);
      });

      // Only the last value should win
      expect(result.current.filters.search).toBe('TR-001');
    });

    it('marks hasActiveFilters as true after a filter is applied', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.handleFilterChange('status', 'IN_TRANSIT');
        jest.runAllTimers();
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  // ---- clearFilters ----

  describe('clearFilters', () => {
    it('resets filters to defaults', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.handleFilterChange('status', 'DRAFT');
        jest.runAllTimers();
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    });

    it('resets page to 1 when clearing filters', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.setPage(4);
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.page).toBe(1);
    });

    it('hasActiveFilters is false after clearFilters', async () => {
      const fetchFn = jest.fn().mockResolvedValue(makePaginatedResponse([]));
      const { result } = renderHook(
        () =>
          useCrudList({
            entityKey: 'test',
            fetchFn,
            defaultFilters: DEFAULT_FILTERS,
          }),
        { wrapper: makeWrapper() },
      );

      act(() => {
        result.current.handleFilterChange('status', 'RECEIVED');
        jest.runAllTimers();
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });
});

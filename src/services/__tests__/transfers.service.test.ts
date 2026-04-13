/**
 * src/services/__tests__/transfers.service.test.ts
 *
 * Tests for the transfers service functions.
 *
 * Strategy: mock the default export of `src/lib/axios.ts` so that every
 * service call hits a Jest mock instead of the real Axios instance.
 * Each test configures the mock to return the expected data and then asserts
 * on both the HTTP method/path/params used AND the returned value.
 *
 * Note: the Axios interceptor unwraps `response.data.data` automatically.
 * The service functions destructure `{ data }` from the Axios response, so
 * they expect the interceptor to have already unwrapped the envelope.
 * Our mock therefore returns the unwrapped payload directly as `{ data: <payload> }`.
 */

import {
  getTransfers,
  getTransfer,
  dispatchTransfer,
  receiveTransfer,
  completeTransfer,
} from '../transfers.service';
import type { Transfer, TransferQuery } from '../../types/transfer';
import type { PaginatedResponse } from '../../types/common';

// ---------------------------------------------------------------------------
// Mock Axios
// ---------------------------------------------------------------------------

const mockGet = jest.fn();
const mockPatch = jest.fn();

jest.mock('../../lib/axios', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeStore(id: string, name: string) {
  return {
    id,
    name,
    code: id.toUpperCase(),
    type: 'STORE' as const,
    address: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
}

const mockTransfer: Transfer = {
  id: 'tr-1',
  code: 'TR-001',
  from_store_id: 'store-a',
  to_store_id: 'store-b',
  transit_store_id: 'store-t',
  status: 'DRAFT',
  dispatched_by: null,
  received_by: null,
  dispatched_at: null,
  estimated_arrival_at: null,
  received_at: null,
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  from_store: makeStore('store-a', 'Central'),
  to_store: makeStore('store-b', 'North'),
};

const mockPaginatedResponse: PaginatedResponse<Transfer> = {
  items: [mockTransfer],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('transfers.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- getTransfers ----

  describe('getTransfers()', () => {
    it('calls GET /transferences without params when none provided', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await getTransfers();

      expect(mockGet).toHaveBeenCalledWith('/transferences', {
        params: undefined,
      });
    });

    it('passes query params to GET /transferences', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      const query: TransferQuery = {
        search: 'TR-001',
        statuses: 'DRAFT,IN_TRANSIT',
        page: 2,
        limit: 10,
      };

      await getTransfers(query);

      expect(mockGet).toHaveBeenCalledWith('/transferences', {
        params: query,
      });
    });

    it('returns the unwrapped paginated response', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await getTransfers();

      expect(result).toEqual(mockPaginatedResponse);
    });

    it('returns the items array from the response', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await getTransfers();

      expect(result.items).toHaveLength(1);
      expect(result.items[0].code).toBe('TR-001');
    });

    it('passes dispatched_today and received_today when provided', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      const query: TransferQuery = {
        statuses: 'DISPATCHED,RECEIVED',
        dispatched_today: '2024-05-01',
        received_today: '2024-05-01',
      };

      await getTransfers(query);

      expect(mockGet).toHaveBeenCalledWith(
        '/transferences',
        expect.objectContaining({ params: expect.objectContaining(query) }),
      );
    });
  });

  // ---- getTransfer ----

  describe('getTransfer()', () => {
    it('calls GET /transferences/:id with the correct id', async () => {
      mockGet.mockResolvedValue({ data: mockTransfer });

      await getTransfer('tr-1');

      expect(mockGet).toHaveBeenCalledWith('/transferences/tr-1');
    });

    it('returns the unwrapped transfer object', async () => {
      mockGet.mockResolvedValue({ data: mockTransfer });

      const result = await getTransfer('tr-1');

      expect(result).toEqual(mockTransfer);
      expect(result.code).toBe('TR-001');
    });
  });

  // ---- dispatchTransfer ----

  describe('dispatchTransfer()', () => {
    it('calls PATCH /transferences/:id/dispatch', async () => {
      const dispatched = { ...mockTransfer, status: 'IN_TRANSIT' as const };
      mockPatch.mockResolvedValue({ data: dispatched });

      await dispatchTransfer('tr-1');

      expect(mockPatch).toHaveBeenCalledWith('/transferences/tr-1/dispatch');
    });

    it('returns the updated transfer', async () => {
      const dispatched = { ...mockTransfer, status: 'IN_TRANSIT' as const };
      mockPatch.mockResolvedValue({ data: dispatched });

      const result = await dispatchTransfer('tr-1');

      expect(result.status).toBe('IN_TRANSIT');
    });

    it('does not send a request body', async () => {
      const dispatched = { ...mockTransfer, status: 'IN_TRANSIT' as const };
      mockPatch.mockResolvedValue({ data: dispatched });

      await dispatchTransfer('tr-1');

      // Called with exactly one argument (the URL), no body
      expect(mockPatch).toHaveBeenCalledWith('/transferences/tr-1/dispatch');
      expect(mockPatch.mock.calls[0]).toHaveLength(1);
    });
  });

  // ---- receiveTransfer ----

  describe('receiveTransfer()', () => {
    it('calls PATCH /transferences/:id/receive', async () => {
      const received = { ...mockTransfer, status: 'RECEIVED' as const };
      mockPatch.mockResolvedValue({ data: received });

      await receiveTransfer('tr-1');

      expect(mockPatch).toHaveBeenCalledWith(
        '/transferences/tr-1/receive',
        undefined,
      );
    });

    it('sends the payload body when provided', async () => {
      const received = { ...mockTransfer, status: 'RECEIVED' as const };
      mockPatch.mockResolvedValue({ data: received });
      const payload = {
        lines: [{ line_id: 'line-1', quantity_received: 5 }],
        incident_notes: 'Missing 2 items',
      };

      await receiveTransfer('tr-1', payload);

      expect(mockPatch).toHaveBeenCalledWith(
        '/transferences/tr-1/receive',
        payload,
      );
    });

    it('returns the updated transfer after receiving', async () => {
      const received = { ...mockTransfer, status: 'RECEIVED' as const };
      mockPatch.mockResolvedValue({ data: received });

      const result = await receiveTransfer('tr-1');

      expect(result.status).toBe('RECEIVED');
    });
  });

  // ---- completeTransfer ----

  describe('completeTransfer()', () => {
    it('calls PATCH /transferences/:id/complete', async () => {
      const completed = { ...mockTransfer, status: 'DISPATCHED' as const };
      mockPatch.mockResolvedValue({ data: completed });

      await completeTransfer('tr-1');

      expect(mockPatch).toHaveBeenCalledWith('/transferences/tr-1/complete');
    });

    it('returns the updated transfer', async () => {
      const completed = { ...mockTransfer, status: 'DISPATCHED' as const };
      mockPatch.mockResolvedValue({ data: completed });

      const result = await completeTransfer('tr-1');

      expect(result.status).toBe('DISPATCHED');
    });
  });
});

/**
 * src/lib/__tests__/queryKeys.test.ts
 *
 * Verifies that every key factory function returns a stable, predictable
 * array. Stable keys are critical for TanStack Query invalidation to work
 * correctly — if the shape changes, cache misses and stale UI result.
 */

import { queryKeys } from '../queryKeys';

describe('queryKeys', () => {
  // ---- transfers entity ----

  describe('queryKeys.transfers', () => {
    it('all returns the entity root key', () => {
      expect(queryKeys.transfers.all).toEqual(['transferences']);
    });

    it('lists() returns the list scope key', () => {
      expect(queryKeys.transfers.lists()).toEqual(['transferences', 'list']);
    });

    it('list(params) includes the params object in the key', () => {
      const params = { search: 'TR-001', page: 1 };
      expect(queryKeys.transfers.list(params)).toEqual([
        'transferences',
        'list',
        params,
      ]);
    });

    it('list(params) with different params produces different keys', () => {
      const a = queryKeys.transfers.list({ page: 1 });
      const b = queryKeys.transfers.list({ page: 2 });
      expect(a).not.toEqual(b);
    });

    it('details() returns the detail scope key', () => {
      expect(queryKeys.transfers.details()).toEqual([
        'transferences',
        'detail',
      ]);
    });

    it('detail(id) includes the id in the key', () => {
      expect(queryKeys.transfers.detail('abc-123')).toEqual([
        'transferences',
        'detail',
        'abc-123',
      ]);
    });

    it('detail(id) with different ids produces different keys', () => {
      expect(queryKeys.transfers.detail('id-1')).not.toEqual(
        queryKeys.transfers.detail('id-2'),
      );
    });
  });

  // ---- inTransit entity ----

  describe('queryKeys.inTransit', () => {
    it('all returns the in-transit root key', () => {
      expect(queryKeys.inTransit.all).toEqual(['in-transit']);
    });

    it('lists() is scoped under in-transit', () => {
      expect(queryKeys.inTransit.lists()).toEqual(['in-transit', 'list']);
    });

    it('list(params) includes params', () => {
      const params = { statuses: 'DRAFT,IN_TRANSIT' };
      expect(queryKeys.inTransit.list(params)).toEqual([
        'in-transit',
        'list',
        params,
      ]);
    });

    it('detail(id) is scoped under in-transit', () => {
      expect(queryKeys.inTransit.detail('xyz')).toEqual([
        'in-transit',
        'detail',
        'xyz',
      ]);
    });
  });

  // ---- stores entity ----

  describe('queryKeys.stores', () => {
    it('all returns the stores root key', () => {
      expect(queryKeys.stores.all).toEqual(['stores']);
    });

    it('lists() is scoped under stores', () => {
      expect(queryKeys.stores.lists()).toEqual(['stores', 'list']);
    });

    it('list(params) includes params', () => {
      const params = { limit: 100 };
      expect(queryKeys.stores.list(params)).toEqual([
        'stores',
        'list',
        params,
      ]);
    });

    it('detail(id) is scoped under stores', () => {
      expect(queryKeys.stores.detail('store-1')).toEqual([
        'stores',
        'detail',
        'store-1',
      ]);
    });
  });

  // ---- cross-entity isolation ----

  describe('key isolation between entities', () => {
    it('transfers and inTransit root keys are different', () => {
      expect(queryKeys.transfers.all).not.toEqual(queryKeys.inTransit.all);
    });

    it('transfers list and stores list share the same structure but differ in entity', () => {
      const tList = queryKeys.transfers.lists();
      const sList = queryKeys.stores.lists();
      expect(tList[0]).not.toBe(sList[0]);
    });
  });
});

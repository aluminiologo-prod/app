/**
 * src/hooks/__tests__/usePermissions.test.ts
 *
 * Tests for the usePermissions hook.
 *
 * Strategy: mock useAuth() to inject different AuthUser / UserRole shapes,
 * then call the hook with renderHook and assert the return values.
 */

import { renderHook } from '@testing-library/react-native';
import { usePermissions } from '../usePermissions';
import { ModuleCode } from '../../config/module-codes';
import type { AuthUser } from '../../types/auth';
import type { UserRole, Permission } from '../../types/role';

// ---------------------------------------------------------------------------
// Mock useAuth at the module boundary so each test can override the user
// ---------------------------------------------------------------------------
const mockUseAuth = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makePermission(
  moduleCode: string,
  overrides: Partial<Permission> = {},
): Permission {
  return {
    module_code: moduleCode,
    can_read: false,
    can_create: false,
    can_update: false,
    can_delete: false,
    ...overrides,
  };
}

function makeRole(overrides: Partial<UserRole> = {}): UserRole {
  return {
    id: 'role-1',
    name: 'Operator',
    is_admin: false,
    is_active: true,
    permissions: [],
    ...overrides,
  };
}

function makeUser(role: UserRole | null = null): AuthUser {
  return {
    id: 'user-1',
    email: 'user@test.com',
    first_name: 'Ana',
    last_name: 'Lopez',
    phone: null,
    role_id: role?.id ?? null,
    store_id: null,
    store: null,
    is_active: true,
    role,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- unauthenticated ----

  describe('when user is null (not authenticated)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null });
    });

    it('hasPermission returns false for any module/action', () => {
      const { result } = renderHook(() => usePermissions());
      expect(
        result.current.hasPermission(ModuleCode.TRANSFERENCES, 'can_read'),
      ).toBe(false);
    });

    it('canAccess returns false for any module', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canAccess(ModuleCode.ARTICLES)).toBe(false);
    });

    it('isAdmin is false', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAdmin).toBe(false);
    });

    it('noRole is true', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.noRole).toBe(true);
    });
  });

  // ---- admin user ----

  describe('when user has an admin role (is_admin = true)', () => {
    beforeEach(() => {
      const adminRole = makeRole({ is_admin: true, permissions: [] });
      mockUseAuth.mockReturnValue({ user: makeUser(adminRole) });
    });

    it('isAdmin is true', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAdmin).toBe(true);
    });

    it('hasPermission returns true for any module/action regardless of permissions array', () => {
      const { result } = renderHook(() => usePermissions());
      expect(
        result.current.hasPermission(ModuleCode.TRANSFERENCES, 'can_delete'),
      ).toBe(true);
    });

    it('canAccess returns true for any module', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canAccess(ModuleCode.ROLES)).toBe(true);
    });

    it('noRole is false', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.noRole).toBe(false);
    });
  });

  // ---- user with no role object ----

  describe('when user exists but has no role (role = null)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: makeUser(null) });
    });

    it('noRole is true', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.noRole).toBe(true);
    });

    it('hasPermission returns true (no role = full access guard skipped)', () => {
      // Matches the implementation: if (noRole || isAdmin) return true
      const { result } = renderHook(() => usePermissions());
      expect(
        result.current.hasPermission(ModuleCode.ARTICLES, 'can_read'),
      ).toBe(true);
    });
  });

  // ---- non-admin user with specific permissions ----

  describe('when user has a non-admin role with specific permissions', () => {
    const permissions: Permission[] = [
      makePermission(ModuleCode.TRANSFERENCES, {
        can_read: true,
        can_update: true,
      }),
      makePermission(ModuleCode.ARTICLES, { can_read: true }),
    ];

    beforeEach(() => {
      const role = makeRole({ is_admin: false, permissions });
      mockUseAuth.mockReturnValue({ user: makeUser(role) });
    });

    it('hasPermission returns true when can_read is granted for a module', () => {
      const { result } = renderHook(() => usePermissions());
      expect(
        result.current.hasPermission(ModuleCode.TRANSFERENCES, 'can_read'),
      ).toBe(true);
    });

    it('hasPermission returns true when can_update is granted', () => {
      const { result } = renderHook(() => usePermissions());
      expect(
        result.current.hasPermission(ModuleCode.TRANSFERENCES, 'can_update'),
      ).toBe(true);
    });

    it('hasPermission returns false when can_create is not granted', () => {
      const { result } = renderHook(() => usePermissions());
      expect(
        result.current.hasPermission(ModuleCode.TRANSFERENCES, 'can_create'),
      ).toBe(false);
    });

    it('hasPermission returns false for a module not in the permissions array', () => {
      const { result } = renderHook(() => usePermissions());
      expect(
        result.current.hasPermission(ModuleCode.ROLES, 'can_read'),
      ).toBe(false);
    });

    it('canAccess returns true when can_read is granted', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canAccess(ModuleCode.ARTICLES)).toBe(true);
    });

    it('canAccess returns false for a module not in permissions', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canAccess(ModuleCode.STORES)).toBe(false);
    });

    it('isAdmin is false', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAdmin).toBe(false);
    });
  });
});

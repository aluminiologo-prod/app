import { useAuth } from '../contexts/AuthContext';
import type { ModuleCode, PermissionAction } from '../config/module-codes';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role ?? null;

  const isAdmin = role?.is_admin === true;
  const noRole = !role;

  function hasPermission(moduleCode: ModuleCode, action: PermissionAction): boolean {
    if (!user) return false;
    if (noRole || isAdmin) return true;
    const perm = role?.permissions.find((p) => p.module_code === moduleCode);
    return perm?.[action] === true;
  }

  function canAccess(moduleCode: ModuleCode): boolean {
    return hasPermission(moduleCode, 'can_read');
  }

  return { hasPermission, canAccess, isAdmin, noRole };
}

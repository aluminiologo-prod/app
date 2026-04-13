export interface Permission {
  module_code: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  is_admin: boolean;
  is_active: boolean;
  permissions: Permission[];
}

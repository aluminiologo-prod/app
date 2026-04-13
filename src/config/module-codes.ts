export enum ModuleCode {
  ARTICLES          = 'ARTICLES',
  DEPARTMENTS       = 'DEPARTMENTS',
  CATEGORIES        = 'CATEGORIES',
  SUBCATEGORIES     = 'SUBCATEGORIES',
  SYSTEMS           = 'SYSTEMS',
  COLORS            = 'COLORS',
  COMPOSITIONS      = 'COMPOSITIONS',
  CLIENTS           = 'CLIENTS',
  CLIENT_TYPES      = 'CLIENT_TYPES',
  STOCK_MATRIX      = 'STOCK_MATRIX',
  TRANSFERENCES     = 'TRANSFERENCES',
  INVENTORY_ADJUSTMENTS = 'INVENTORY_ADJUSTMENTS',
  ASSEMBLY_ORDERS   = 'ASSEMBLY_ORDERS',
  PURCHASES         = 'PURCHASES',
  SUPPLIERS         = 'SUPPLIERS',
  ROLES             = 'ROLES',
  STORES            = 'STORES',
  ACCESS_CONTROL    = 'ACCESS_CONTROL',
}

export type PermissionAction = 'can_read' | 'can_create' | 'can_update' | 'can_delete';

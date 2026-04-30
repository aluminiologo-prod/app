import type { Store } from './store';
import type { PaginatedResponse } from './common';

export type TransferStatus = 'TO_BE_APPROVED' | 'DRAFT' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export interface VariantStockRecord {
  id: string;
  article_variant_id: string;
  store_id: string;
  quantity: number;
  reserved_quantity: number;
  incoming_quantity: number;
  min_stock: number;
  safety_stock: number;
  max_stock: number;
  reorder_quantity: number;
}

export interface VariantPhoto {
  id: string;
  url: string;
  is_primary?: boolean;
}

export interface ArticleVariantMinimal {
  id: string;
  sku: string;
  article: {
    id: string;
    name: string;
  };
  color?: {
    id: string;
    name: string;
    hex: string;
    hex_code?: string;
  } | null;
  photos?: VariantPhoto[];
  stock?: VariantStockRecord[];
}

export interface TransferLine {
  id: string;
  transfer_order_id: string;
  article_variant_id: string;
  quantity_sent: number;
  quantity_received: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  article_variant: ArticleVariantMinimal;
}

export interface Transfer {
  id: string;
  code: string;
  from_store_id: string;
  to_store_id: string;
  transit_store_id: string;
  status: TransferStatus;
  dispatched_by: string | null;
  received_by: string | null;
  dispatched_at: string | null;
  estimated_arrival_at: string | null;
  received_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  from_store: Store;
  to_store: Store;
  transit_store?: Store;
  lines?: TransferLine[];
  incident?: TransferIncident | null;
  _count?: { lines: number };
  _total_quantity_sent?: number;
}

export interface TransferIncident {
  id: string;
  transfer_order_id: string;
  notes: string | null;
  reported_by: string;
  created_at: string;
  reporter?: { id: string; first_name: string; last_name: string } | null;
}

export interface ReceiveTransferLinePayload {
  line_id: string;
  quantity_received: number;
}

export interface ReceiveTransferPayload {
  lines?: ReceiveTransferLinePayload[];
  incident_notes?: string;
}

export interface TransferQuery {
  search?: string;
  status?: TransferStatus;
  statuses?: string;
  from_store_id?: string;
  to_store_id?: string;
  orderBy?: string;
  page?: number;
  limit?: number;
  received_today?: string;
}

export type { PaginatedResponse };

import api from '../lib/axios';
import type {
  Transfer,
  TransferQuery,
  ReceiveTransferPayload,
  PaginatedResponse,
} from '../types/transfer';

export async function getTransfers(params?: TransferQuery): Promise<PaginatedResponse<Transfer>> {
  const { data } = await api.get('/transferences', { params });
  return data;
}

export async function getTransfer(id: string): Promise<Transfer> {
  const { data } = await api.get(`/transferences/${id}`);
  return data;
}

export async function dispatchTransfer(id: string): Promise<Transfer> {
  const { data } = await api.patch(`/transferences/${id}/dispatch`);
  return data;
}

export async function receiveTransfer(id: string, payload?: ReceiveTransferPayload): Promise<Transfer> {
  const { data } = await api.patch(`/transferences/${id}/receive`, payload);
  return data;
}

export async function completeTransfer(id: string): Promise<Transfer> {
  const { data } = await api.patch(`/transferences/${id}/complete`);
  return data;
}

export async function approveAutomaticTransfer(id: string): Promise<Transfer> {
  const { data } = await api.patch(`/transferences/${id}/approve-auto`);
  return data;
}

export async function rejectAutomaticTransfer(id: string): Promise<Transfer> {
  const { data } = await api.patch(`/transferences/${id}/reject-auto`);
  return data;
}

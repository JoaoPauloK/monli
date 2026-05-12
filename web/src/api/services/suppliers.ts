import type { SupplierCreate, SupplierRead, SupplierUpdate } from '@/types/supplier'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function listSuppliers(): Promise<SupplierRead[]> {
  const res = await apiClient.get<SupplierRead[]>(API.SUPPLIERS.LIST)
  return res.data
}

export async function createSupplier(data: SupplierCreate): Promise<SupplierRead> {
  const res = await apiClient.post<SupplierRead>(API.SUPPLIERS.CREATE, data)
  return res.data
}

export async function getSupplier(id: string): Promise<SupplierRead> {
  const res = await apiClient.get<SupplierRead>(API.SUPPLIERS.GET(id))
  return res.data
}

export async function updateSupplier(id: string, data: SupplierUpdate): Promise<SupplierRead> {
  const res = await apiClient.patch<SupplierRead>(API.SUPPLIERS.UPDATE(id), data)
  return res.data
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(API.SUPPLIERS.DELETE(id))
}
import type { PurchaseCreate, PurchaseExtraction, PurchaseImageConfirm, PurchaseRead, PurchaseUpdate } from '@/types/purchase'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function createPurchase(data: PurchaseCreate): Promise<PurchaseRead> {
  const res = await apiClient.post<PurchaseRead>(API.PURCHASES.CREATE, data)
  return res.data
}

export async function listPurchases(): Promise<PurchaseRead[]> {
  const res = await apiClient.get<PurchaseRead[]>(API.PURCHASES.LIST)
  return res.data
}

export async function getPurchase(id: string): Promise<PurchaseRead> {
  const res = await apiClient.get<PurchaseRead>(API.PURCHASES.DETAIL(id))
  return res.data
}

export async function deletePurchase(id: string): Promise<void> {
  await apiClient.delete(API.PURCHASES.DELETE(id))
}

export async function previewPurchaseFromImage(file: File): Promise<PurchaseExtraction> {
  const formData = new FormData()
  formData.append('image_bytes', file)

  const res = await apiClient.post<PurchaseExtraction>(
    API.PURCHASES.PREVIEW_BY_IMAGE,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )

  return res.data
}

export async function confirmPurchaseFromImage(data: PurchaseImageConfirm): Promise<PurchaseRead> {
  const res = await apiClient.post<PurchaseRead>(API.PURCHASES.CREATE_BY_IMAGE, data)
  return res.data
}

export async function updatePurchase(id: string, data: PurchaseUpdate): Promise<PurchaseRead> {
  const res = await apiClient.patch<PurchaseRead>(API.PURCHASES.UPDATE(id), data)
  return res.data
}
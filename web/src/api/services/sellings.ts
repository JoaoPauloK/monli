import type { SellingCreate, SellingDetailRead, SellingRead, SellingUpdate } from '@/types/selling'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function listSellings(): Promise<SellingRead[]> {
  const res = await apiClient.get<SellingRead[]>(API.SELLINGS.LIST)
  return res.data
}

export async function createSelling(data: SellingCreate): Promise<SellingRead> {
  const res = await apiClient.post<SellingRead>(API.SELLINGS.CREATE, data)
  return res.data
}

export async function getSelling(id: string): Promise<SellingDetailRead> {
  const res = await apiClient.get<SellingDetailRead>(API.SELLINGS.GET(id))
  return res.data
}

export async function updateSelling(id: string, data: SellingUpdate): Promise<SellingDetailRead> {
  const res = await apiClient.patch<SellingDetailRead>(API.SELLINGS.UPDATE(id), data)
  return res.data
}

import type { InventoryItemRead } from '@/types/inventory'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function getLowStock(): Promise<InventoryItemRead[]> {
  const res = await apiClient.get<InventoryItemRead[]>(API.INVENTORY.LOW_STOCK)
  return res.data
}

export async function getIngredientInventory(id: string): Promise<InventoryItemRead> {
  const res = await apiClient.get<InventoryItemRead>(API.INVENTORY.INGREDIENT(id))
  return res.data
}

export async function getProductInventory(id: string): Promise<InventoryItemRead> {
  const res = await apiClient.get<InventoryItemRead>(API.INVENTORY.PRODUCT(id))
  return res.data
}

import type { IngredientCreate, IngredientRead, IngredientUpdate } from '@/types/ingredient'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function listIngredients(): Promise<IngredientRead[]> {
  const res = await apiClient.get<IngredientRead[]>(API.INGREDIENTS.LIST)
  return res.data
}

export async function createIngredient(data: IngredientCreate): Promise<IngredientRead> {
  const res = await apiClient.post<IngredientRead>(API.INGREDIENTS.CREATE, data)
  return res.data
}

export async function getIngredient(id: string): Promise<IngredientRead> {
  const res = await apiClient.get<IngredientRead>(API.INGREDIENTS.GET(id))
  return res.data
}

export async function updateIngredient(id: string, data: IngredientUpdate): Promise<IngredientRead> {
  const res = await apiClient.patch<IngredientRead>(API.INGREDIENTS.UPDATE(id), data)
  return res.data
}

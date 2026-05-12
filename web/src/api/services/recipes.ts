import type { RecipeCreate, RecipeRead } from '@/types/recipe'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function createRecipe(data: RecipeCreate): Promise<RecipeRead> {
  const res = await apiClient.post<RecipeRead>(API.RECIPES.CREATE, data)
  return res.data
}

export async function getProductRecipe(productId: string): Promise<RecipeRead | null> {
  const res = await apiClient.get<RecipeRead | null>(API.RECIPES.GET_BY_PRODUCT(productId))
  return res.data
}

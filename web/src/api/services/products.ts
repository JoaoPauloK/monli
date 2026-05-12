import type { ProductCreate, ProductRead, ProductUpdate } from '@/types/product'
import type { ProductCostRead } from '@/types/recipe'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function listProducts(): Promise<ProductRead[]> {
  const res = await apiClient.get<ProductRead[]>(API.PRODUCTS.LIST)
  return res.data
}

export async function createProduct(data: ProductCreate): Promise<ProductRead> {
  const res = await apiClient.post<ProductRead>(API.PRODUCTS.CREATE, data)
  return res.data
}

export async function getProduct(id: string): Promise<ProductRead> {
  const res = await apiClient.get<ProductRead>(API.PRODUCTS.GET(id))
  return res.data
}

export async function getProductCost(productId: string): Promise<ProductCostRead> {
  const res = await apiClient.get<ProductCostRead>(API.RECIPES.COST(productId))
  return res.data
}

export async function updateProduct(id: string, data: ProductUpdate): Promise<ProductRead> {
  const res = await apiClient.patch<ProductRead>(API.PRODUCTS.UPDATE(id), data)
  return res.data
}

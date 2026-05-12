import { useQuery } from '@tanstack/react-query'
import {
  getIngredientInventory,
  getLowStock,
  getProductInventory,
} from '@/api/services/inventory'

export function useLowStock() {
  return useQuery({ queryKey: ['inventory', 'low-stock'], queryFn: getLowStock, staleTime: 0 })
}

export function useIngredientInventory(id: string) {
  return useQuery({
    queryKey: ['inventory', 'ingredient', id],
    queryFn: () => getIngredientInventory(id),
    enabled: !!id,
  })
}

export function useProductInventory(id: string) {
  return useQuery({
    queryKey: ['inventory', 'product', id],
    queryFn: () => getProductInventory(id),
    enabled: !!id,
  })
}

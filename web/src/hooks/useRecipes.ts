import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRecipe, getProductRecipe } from '@/api/services/recipes'
import { getProductCost } from '@/api/services/products'
import type { RecipeCreate } from '@/types/recipe'

export function useProductRecipe(productId: string) {
  return useQuery({
    queryKey: ['recipes', 'product', productId],
    queryFn: () => getProductRecipe(productId),
    enabled: !!productId,
  })
}

export function useProductCost(productId: string) {
  return useQuery({
    queryKey: ['recipes', 'cost', productId],
    queryFn: () => getProductCost(productId),
    enabled: !!productId,
  })
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RecipeCreate) => createRecipe(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['recipes', 'product', variables.product_id] })
      qc.invalidateQueries({ queryKey: ['recipes', 'cost', variables.product_id] })
    },
  })
}

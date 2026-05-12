import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createIngredient, getIngredient, listIngredients, updateIngredient } from '@/api/services/ingredients'
import type { IngredientCreate, IngredientUpdate } from '@/types/ingredient'

export function useIngredientList() {
  return useQuery({ queryKey: ['ingredients'], queryFn: listIngredients })
}

export function useIngredient(id: string) {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: () => getIngredient(id),
    enabled: !!id,
  })
}

export function useCreateIngredient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: IngredientCreate) => createIngredient(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}

export function useUpdateIngredient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: IngredientUpdate) => updateIngredient(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}

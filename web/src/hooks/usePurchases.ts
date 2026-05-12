import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPurchase, getPurchase, listPurchases, updatePurchase } from '@/api/services/purchases'
import type { PurchaseCreate, PurchaseUpdate } from '@/types/purchase'

export function useCreatePurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PurchaseCreate) => createPurchase(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

export function usePurchasesList() {
  return useQuery({ queryKey: ['purchases'], queryFn: listPurchases })
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: () => getPurchase(id),
    enabled: !!id,
  })
}

export function useUpdatePurchase(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PurchaseUpdate) => updatePurchase(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}
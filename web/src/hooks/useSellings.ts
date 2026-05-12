import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSelling, getSelling, listSellings, updateSelling } from '@/api/services/sellings'
import type { SellingCreate, SellingUpdate } from '@/types/selling'

export function useSellingList() {
  return useQuery({ queryKey: ['sellings'], queryFn: listSellings })
}

export function useSelling(id: string) {
  return useQuery({
    queryKey: ['sellings', id],
    queryFn: () => getSelling(id),
    enabled: !!id,
  })
}

export function useCreateSelling() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SellingCreate) => createSelling(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['sellings'] })
    },
  })
}

export function useUpdateSelling(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SellingUpdate) => updateSelling(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sellings'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

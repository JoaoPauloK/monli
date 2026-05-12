import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, getProduct, listProducts, updateProduct } from '@/api/services/products'
import type { ProductCreate, ProductUpdate } from '@/types/product'

export function useProductList() {
  return useQuery({ queryKey: ['products'], queryFn: listProducts })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductCreate) => createProduct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductUpdate) => updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

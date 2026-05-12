export interface ProductRead {
  id: string
  tenant_id: string
  name: string
  description: string | null
  sale_price: string
  estimated_cost: string
  is_active: boolean
}

export interface ProductCreate {
  name: string
  description?: string | null
  sale_price: string
}

export interface ProductUpdate {
  name?: string | null
  description?: string | null
  sale_price?: string
}

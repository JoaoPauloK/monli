export interface SellingProductInput {
  product_id: string
  quantity: string
  unit_price: string
}

export interface SellingCreate {
  products: SellingProductInput[]
  customer_id?: string | null
  sold_on?: string | null
  notes?: string | null
}

export interface SellingUpdate {
  products: { product_id: string; quantity: string; unit_price: string }[]
  customer_id?: string | null
  sold_on?: string | null
  notes?: string | null
}

export interface SellingRead {
  id: string
  tenant_id: string
  customer_id: string | null
  sold_on: string
  total_amount: string
  notes: string | null
}

export interface SellingProductRead {
  id: string
  product_id: string
  quantity: string
  unit_price: string
}

export interface SellingDetailRead extends SellingRead {
  products: SellingProductRead[]
}

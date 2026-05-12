export interface IngredientRead {
  id: string
  tenant_id: string
  name: string
  unit: string
  unit_cost: string
  avg_price: string
  last_price: string
  supplier_id: string | null
}

export interface IngredientCreate {
  name: string
  unit: string
  unit_cost: string
  supplier_id?: string | null
}

export interface IngredientUpdate {
  name?: string | null
  unit?: string | null
  unit_cost?: string
  supplier_id?: string | null
}

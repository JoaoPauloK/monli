import type { IngredientRead } from "./ingredient"
import { SupplierRead } from "./supplier"

export interface PurchaseIngredientInput {
  ingredient_id: string
  quantity: string
  unit_cost: string
}

export interface PurchaseIngredientRead {
  ingredient: IngredientRead
  unit: string
  quantity: string
  unit_cost: string
}

export interface PurchaseCreate {
  ingredients: PurchaseIngredientInput[]
  supplier_id?: string | null
  purchased_on?: string | null
  notes?: string | null
}

export interface PurchaseRead {
  id: string
  tenant_id: string
  supplier: SupplierRead | null
  purchased_on: string
  total_amount: string
  notes: string | null
  ingredients: PurchaseIngredientRead[]
}

export interface PurchaseUpdate {
  ingredients: { ingredient_id: string; quantity: string; unit_cost: string }[]
  supplier_id?: string | null
  purchased_on?: string | null
  notes?: string | null
}

export interface ExtractedItem {
  name: string
  quantity: string
  unit_cost: string
  unit: string
  matched_ingredient_id: string | null
  is_new_ingredient: boolean
}

export interface PurchaseExtraction {
  purchase_date: string | null
  total_amount: string | null
  ingredients: ExtractedItem[]
}

export interface ExtractedItemConfirm {
  matched_ingredient_id: string | null
  name: string
  unit: string
  quantity: string
  unit_cost: string
}

export interface PurchaseImageConfirm {
  ingredients: ExtractedItemConfirm[]
  purchase_date: string | null
  notes: string | null
}

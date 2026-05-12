export type InventoryItemType = 'INGREDIENT' | 'PRODUCT'

export interface InventoryItemRead {
  id: string
  tenant_id: string
  item_type: InventoryItemType
  ingredient_id: string | null
  product_id: string | null
  quantity: string
  minimum_quantity: string
  created_at: string
  updated_at: string
}

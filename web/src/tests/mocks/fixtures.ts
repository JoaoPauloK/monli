import type { UserRead } from '@/types/auth'
import type { IngredientRead } from '@/types/ingredient'
import type { InventoryItemRead } from '@/types/inventory'
import type { ProductRead } from '@/types/product'

export const mockUser: UserRead = {
  id: '11111111-1111-1111-1111-111111111111',
  tenant_id: '22222222-2222-2222-2222-222222222222',
  full_name: 'João Silva',
  email: 'joao@padaria.com',
  is_superuser: false,
}

export const mockProduct: ProductRead = {
  id: '33333333-3333-3333-3333-333333333333',
  tenant_id: mockUser.tenant_id,
  name: 'Bolo de Chocolate',
  description: 'Delicioso bolo',
  sale_price: '25.00',
  estimated_cost: '12.50',
  is_active: true,
}

export const mockIngredient: IngredientRead = {
  id: '44444444-4444-4444-4444-444444444444',
  tenant_id: mockUser.tenant_id,
  name: 'Farinha de Trigo',
  unit: 'kg',
  unit_cost: '4.50',
  supplier_id: null,
}

export const mockInventory: InventoryItemRead = {
  id: '55555555-5555-5555-5555-555555555555',
  tenant_id: mockUser.tenant_id,
  item_type: 'INGREDIENT',
  ingredient_id: mockIngredient.id,
  product_id: null,
  quantity: '10.000',
  minimum_quantity: '2.000',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

import { type IngredientRead } from "./ingredient"

export interface RecipeIngredientInput {
  ingredient_id: string
  quantity: string
}

export interface RecipeCreate {
  product_id: string
  ingredients: RecipeIngredientInput[]
  instructions?: string | null
}

export interface RecipeIngredientRead {
  ingredient: IngredientRead
  unit: string
  quantity: string
}

export interface RecipeRead {
  id: string
  tenant_id: string
  product_id: string
  instructions: string | null
  ingredients: RecipeIngredientRead[]
}

export interface ProductCostRead {
  product_id: string
  estimated_cost: string
}

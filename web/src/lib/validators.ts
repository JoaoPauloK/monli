import { z } from 'zod'

export const signupSchema = z.object({
  full_name: z.string().min(1, 'Nome obrigatório').max(150),
  email: z.email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  tenant_name: z.string().min(1, 'Nome da empresa obrigatório').max(120),
  tenant_slug: z
    .string()
    .min(1, 'Identificador obrigatório')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
})

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
  tenant_slug: z.string().min(1, 'Identificador da empresa obrigatório'),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(120),
  description: z.string().max(500).optional().nullable(),
  sale_price: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Preço inválido'),
})

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(120),
  unit: z.string().min(1, 'Unidade obrigatória').max(20),
  unit_cost: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Custo inválido'),
})

const lineItemIngredientSchema = z.object({
  ingredient_id: z.string().min(1, 'Selecione um ingrediente'),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Quantidade inválida'),
  unit_cost: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Custo inválido'),
})

export const purchaseSchema = z.object({
  ingredients: z.array(lineItemIngredientSchema).min(1, 'Adicione pelo menos um ingrediente'),
  purchased_on: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

const lineItemProductSchema = z.object({
  product_id: z.string().min(1, 'Selecione um produto'),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Quantidade inválida'),
  unit_price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Preço inválido'),
})

export const saleSchema = z.object({
  products: z.array(lineItemProductSchema).min(1, 'Adicione pelo menos um produto'),
  sold_on: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

const optionalText = (max: number) =>
  z.preprocess((v) => (v === '' ? null : v), z.string().max(max).nullable().optional())

const optionalEmail = z.preprocess(
  (v) => (v === '' ? null : v),
  z.email('E-mail inválido').nullable().optional(),
)

export const supplierSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(120),
  email: optionalEmail,
  phone: optionalText(32),
  notes: optionalText(500),
})

export const customerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(120),
  email: optionalEmail,
  phone: optionalText(32),
  notes: optionalText(500),
})

export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type IngredientFormData = z.infer<typeof ingredientSchema>
export type PurchaseFormData = z.infer<typeof purchaseSchema>
export type SaleFormData = z.infer<typeof saleSchema>
export type SupplierFormData = z.infer<typeof supplierSchema>
export type CustomerFormData = z.infer<typeof customerSchema>

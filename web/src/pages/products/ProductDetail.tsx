// Copyright (c) 2026 Monli. All rights reserved.
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useProduct, useUpdateProduct } from '@/hooks/useProducts'
import { useIngredientList } from '@/hooks/useIngredients'
import { useCreateRecipe, useProductCost, useProductRecipe } from '@/hooks/useRecipes'
import { useProductInventory } from '@/hooks/useInventory'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Combobox from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { calcMargin, formatCurrency, formatPercent } from '@/lib/formatters'
import { productSchema, type ProductFormData } from '@/lib/validators'
import type { RecipeCreate } from '@/types/recipe'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id!)
  const { data: cost } = useProductCost(id!)
  const { data: inventory } = useProductInventory(id!)
  const { data: ingredients = [] } = useIngredientList()
  const { data: recipe } = useProductRecipe(id!)
  const createRecipe = useCreateRecipe()
  const updateMutation = useUpdateProduct(id!)
  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [editing, setEditing] = useState(false)

  const ingredientOptions = useMemo(
    () => ingredients.map((ing) => ({ value: ing.id, label: ing.name, sublabel: ing.unit })),
    [ingredients],
  )

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) })

  const { register, control, handleSubmit, reset } = useForm<RecipeCreate>({
    defaultValues: { product_id: id, ingredients: [{ ingredient_id: '', quantity: '' }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })

  useEffect(() => {
    if (showRecipeForm && recipe) {
      reset({
        product_id: id,
        instructions: recipe.instructions ?? undefined,
        ingredients: recipe.ingredients.map((ri) => ({
          ingredient_id: ri.ingredient.id,
          quantity: String(ri.quantity),
        })),
      })
    } else if (showRecipeForm && !recipe) {
      reset({ product_id: id, ingredients: [{ ingredient_id: '', quantity: '' }] })
    }
  }, [showRecipeForm, recipe, id, reset])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!product) return null

  const margin = calcMargin(product.sale_price, product.estimated_cost)

  const startEdit = () => {
    resetEdit({
      name: product.name,
      description: product.description ?? '',
      sale_price: product.sale_price,
    })
    setEditing(true)
  }

  const onEditSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data, { onSuccess: () => setEditing(false) })
  }

  const onRecipeSubmit = (data: RecipeCreate) => {
    createRecipe.mutate(data, { onSuccess: () => setShowRecipeForm(false) })
  }

  return (
    <>
      <TopBar title={product.name} back />
      <PageContainer>
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-6">
          {/* Left column: pricing + inventory */}
          <div className="flex flex-col gap-4">
            {editing ? (
              <Card>
                <form onSubmit={handleEditSubmit(onEditSubmit)} className="flex flex-col gap-4">
                  <Input
                    label="Nome"
                    error={editErrors.name?.message}
                    {...registerEdit('name')}
                  />
                  <Input
                    label="Descrição"
                    error={editErrors.description?.message}
                    {...registerEdit('description')}
                  />
                  <Input
                    label="Preço de venda"
                    type="number"
                    step="0.01"
                    error={editErrors.sale_price?.message}
                    {...registerEdit('sale_price')}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setEditing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" loading={updateMutation.isPending} className="flex-1">
                      Salvar
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Preço de venda</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(product.sale_price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={margin >= 0.3 ? 'green' : margin >= 0.1 ? 'yellow' : 'red'}>
                      {formatPercent(margin)}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={startEdit}>
                      Editar
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex gap-4 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs text-gray-400">Custo estimado</p>
                    <p className="text-sm font-medium text-gray-700">
                      {cost ? formatCurrency(cost.estimated_cost) : formatCurrency(product.estimated_cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <Badge color={product.is_active ? 'green' : 'gray'} className="mt-0.5">
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </Card>
            )}

            {inventory && (
              <Card>
                <p className="mb-2 text-sm font-medium text-gray-700">Estoque</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{inventory.quantity}</p>
                    <p className="text-xs text-gray-400">unidades disponíveis</p>
                  </div>
                  <Badge
                    color={
                      Number(inventory.quantity) <= Number(inventory.minimum_quantity)
                        ? 'red'
                        : 'green'
                    }
                  >
                    {Number(inventory.quantity) <= Number(inventory.minimum_quantity)
                      ? 'Estoque baixo'
                      : 'OK'}
                  </Badge>
                </div>
              </Card>
            )}
          </div>

          {/* Right column: recipe */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Receita</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecipeForm((v) => !v)}
              >
                {showRecipeForm ? 'Cancelar' : recipe ? 'Editar receita' : 'Adicionar receita'}
              </Button>
            </div>

            {showRecipeForm ? (
              <form onSubmit={handleSubmit(onRecipeSubmit)} className="flex flex-col gap-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <div className="w-4/6">
                      <Controller
                        control={control}
                        name={`ingredients.${index}.ingredient_id`}
                        render={({ field }) => (
                          <Combobox
                            options={ingredientOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecionar ingrediente"
                          />
                        )}
                      />
                    </div>
                    <div className='w-2/6'>
                        <Input
                          placeholder="Qtd"
                          type="number"
                          step="0.001"
                          {...register(`ingredients.${index}.quantity`)}
                        />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex h-11 w-9 items-center justify-center rounded-xl text-red-400 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => append({ ingredient_id: '', quantity: '' })}
                  className="self-start"
                >
                  <Plus size={16} /> Adicionar ingrediente
                </Button>

                <textarea
                  placeholder="Instruções (opcional)"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                  {...register('instructions')}
                />

                <Button type="submit" loading={createRecipe.isPending} className="w-full">
                  Salvar receita
                </Button>
              </form>
            ) : recipe && recipe.ingredients.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {recipe.ingredients.map((ri) => (
                  <li key={ri.ingredient.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{ri.ingredient.name}</span>
                    <span className="text-gray-500">
                      {ri.quantity} {ri.ingredient.unit}
                    </span>
                  </li>
                ))}
                {recipe.instructions && (
                  <li className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-400">
                    {recipe.instructions}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Nenhuma receita cadastrada ainda.</p>
            )}
          </Card>
        </div>
      </PageContainer>
    </>
  )
}

// Copyright (c) 2026 Monli. All rights reserved.
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useIngredient, useUpdateIngredient } from '@/hooks/useIngredients'
import { useIngredientInventory } from '@/hooks/useInventory'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { formatCurrency } from '@/lib/formatters'
import { ingredientSchema, type IngredientFormData } from '@/lib/validators'

export default function IngredientDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: ingredient, isLoading } = useIngredient(id!)
  const { data: inventory } = useIngredientInventory(id!)
  const updateMutation = useUpdateIngredient(id!)
  const [editing, setEditing] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IngredientFormData>({ resolver: zodResolver(ingredientSchema) })

  const startEdit = () => {
    reset({
      name: ingredient!.name,
      unit: ingredient!.unit,
      unit_cost: ingredient!.unit_cost,
    })
    setEditing(true)
  }

  const onSubmit = (data: IngredientFormData) => {
    updateMutation.mutate(data, { onSuccess: () => setEditing(false) })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!ingredient) return null

  return (
    <>
      <TopBar title={ingredient.name} back />
      <PageContainer>
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
          {editing ? (
            <Card>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Nome"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Unidade"
                  error={errors.unit?.message}
                  {...register('unit')}
                />
                <Input
                  label="Custo por unidade"
                  type="number"
                  step="0.01"
                  error={errors.unit_cost?.message}
                  {...register('unit_cost')}
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
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-xs text-gray-400">Custo por unidade</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(ingredient.unit_cost)}
                    </p>
                    <p className="text-xs text-gray-500">por {ingredient.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Unidade</p>
                    <p className="text-xl font-bold text-gray-900">{ingredient.unit}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={startEdit}>
                  Editar
                </Button>
              </div>
            </Card>
          )}

          <Card>
            <p className="mb-3 text-sm font-medium text-gray-700">Histórico de preços</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Preço médio</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(ingredient.avg_price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Último preço</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(ingredient.last_price)}
                </p>
              </div>
            </div>
          </Card>

          {inventory && (
            <Card>
              <p className="mb-3 text-sm font-medium text-gray-700">Estoque atual</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {inventory.quantity}{' '}
                    <span className="text-sm font-normal text-gray-400">{ingredient.unit}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Mínimo: {inventory.minimum_quantity} {ingredient.unit}
                  </p>
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
                    : 'Estoque OK'}
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </PageContainer>
    </>
  )
}

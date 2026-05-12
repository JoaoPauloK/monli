// Copyright (c) 2026 Monli. All rights reserved.
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { usePurchase, useUpdatePurchase } from '@/hooks/usePurchases'
import { useIngredientList } from '@/hooks/useIngredients'
import { useSupplierList } from '@/hooks/useSuppliers'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Combobox from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import Textarea from '@/components/ui/Textarea'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { purchaseSchema, type PurchaseFormData } from '@/lib/validators'

export default function PurchaseDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: purchase, isLoading } = usePurchase(id!)
  const { data: ingredients = [] } = useIngredientList()
  const { data: suppliers = [] } = useSupplierList()
  const updateMutation = useUpdatePurchase(id!)
  const [editing, setEditing] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseFormData>({ resolver: zodResolver(purchaseSchema) })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })
  const watchedItems = useWatch({ control, name: 'ingredients' })

  const ingredientOptions = useMemo(
    () => ingredients.map((ing) => ({ value: ing.id, label: ing.name, sublabel: ing.unit })),
    [ingredients],
  )

  const total = (watchedItems ?? []).reduce((sum, item) => {
    const qty = Number(item?.quantity ?? 0)
    const cost = Number(item?.unit_cost ?? 0)
    return sum + qty * cost
  }, 0)

  const startEdit = () => {
    reset({
      purchased_on: purchase!.purchased_on,
      notes: purchase!.notes ?? '',
      ingredients: purchase!.ingredients.map((item) => ({
        ingredient_id: item.ingredient.id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
      })),
    })
    setEditing(true)
  }

  const onSubmit = (data: PurchaseFormData) => {
    const supplierId = (data as PurchaseFormData & { supplier_id?: string }).supplier_id
    updateMutation.mutate(
      {
        ingredients: data.ingredients.map((i) => ({
          ingredient_id: i.ingredient_id,
          quantity: i.quantity,
          unit_cost: i.unit_cost,
        })),
        purchased_on: data.purchased_on ?? null,
        supplier_id: supplierId ?? null,
        notes: data.notes ?? null,
      },
      { onSuccess: () => setEditing(false) },
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!purchase) return null

  const productMap = Object.fromEntries(ingredients.map((p) => [p.id, p.name]))

  if (editing) {
    return (
      <>
        <TopBar title="Editar compra" back />
        <PageContainer>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Data da compra" type="date" {...register('purchased_on')} />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Fornecedor</label>
              <select
                {...register('supplier_id' as keyof PurchaseFormData)}
                defaultValue={purchase.supplier?.id ?? ''}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="">Sem fornecedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <Card padding="sm">
              <p className="mb-3 text-sm font-medium text-gray-700">Ingredientes</p>
              <div className="flex flex-col gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`ingredients.${index}.ingredient_id`}
                        render={({ field }) => (
                          <Combobox
                            options={ingredientOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecionar ingrediente"
                            className="flex-1"
                          />
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl text-red-400 hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Quantidade"
                        type="number"
                        step="0.001"
                        error={errors.ingredients?.[index]?.quantity?.message}
                        {...register(`ingredients.${index}.quantity`)}
                      />
                      <Input
                        placeholder="Custo unit. R$"
                        type="number"
                        step="0.01"
                        error={errors.ingredients?.[index]?.unit_cost?.message}
                        {...register(`ingredients.${index}.unit_cost`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => append({ ingredient_id: '', quantity: '', unit_cost: '' })}
                className="mt-3 w-full"
              >
                <Plus size={16} /> Adicionar ingrediente
              </Button>
            </Card>

            <Card padding="sm" className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Total da compra</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
            </Card>

            <Textarea
              label="Observações (opcional)"
              placeholder="Número da nota..."
              rows={2}
              {...register('notes')}
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
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <TopBar title="Detalhes da compra" back />
      <PageContainer>
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-center justify-between flex-1">
                <div>
                  <p className="text-xs text-gray-400">Data</p>
                  <p className="font-medium text-gray-900">{formatDate(purchase.purchased_on)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(purchase.total_amount)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={startEdit} className="ml-3 shrink-0">
                Editar
              </Button>
            </div>
            {purchase.supplier && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">Fornecedor</p>
                <p className="font-medium text-gray-900">
                  <span className="inline-flex items-center gap-1">
                    {purchase.supplier.name}
                  </span>
                </p>
              </div>
            )}
            {purchase.notes && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">Observações</p>
                <p className="text-sm text-gray-600">{purchase.notes}</p>
              </div>
            )}
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium text-gray-700">Produtos comprados</p>
            <div className="flex flex-col gap-2">
              {purchase.ingredients.map((item) => (
                <div key={item.ingredient.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">
                      {productMap[item.ingredient.id] ?? item.ingredient.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} × {formatCurrency(item.unit_cost)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(String(Number(item.quantity) * Number(item.unit_cost)))}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  )
}

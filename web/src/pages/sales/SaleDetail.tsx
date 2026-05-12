// Copyright (c) 2026 Monli. All rights reserved.
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useSelling, useUpdateSelling } from '@/hooks/useSellings'
import { useProductList } from '@/hooks/useProducts'
import { useCustomer, useCustomerList } from '@/hooks/useCustomers'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Combobox from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import Textarea from '@/components/ui/Textarea'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { saleSchema, type SaleFormData } from '@/lib/validators'

function CustomerName({ id }: { id: string }) {
  const { data: customer } = useCustomer(id)
  return <span>{customer?.name ?? '…'}</span>
}

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: selling, isLoading } = useSelling(id!)
  const { data: products = [] } = useProductList()
  const { data: customers = [] } = useCustomerList()
  const updateMutation = useUpdateSelling(id!)
  const [editing, setEditing] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SaleFormData>({ resolver: zodResolver(saleSchema) })

  const { fields, append, remove } = useFieldArray({ control, name: 'products' })
  const watchedItems = useWatch({ control, name: 'products' })

  const productOptions = useMemo(
    () =>
      products
        .filter((p) => p.is_active)
        .map((p) => ({ value: p.id, label: p.name, sublabel: formatCurrency(p.sale_price) })),
    [products],
  )

  const total = (watchedItems ?? []).reduce((sum, item) => {
    return sum + Number(item?.quantity ?? 0) * Number(item?.unit_price ?? 0)
  }, 0)

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      setValue(`products.${index}.unit_price`, product.sale_price)
    }
  }

  const startEdit = () => {
    reset({
      sold_on: selling!.sold_on,
      notes: selling!.notes ?? '',
      customer_id: selling!.customer_id ?? '',
      products: selling!.products.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    })
    setEditing(true)
  }

  const onSubmit = (data: SaleFormData) => {
    updateMutation.mutate(
      {
        products: data.products.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
          unit_price: p.unit_price,
        })),
        sold_on: data.sold_on ?? null,
        customer_id: (data as SaleFormData & { customer_id?: string }).customer_id || null,
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

  if (!selling) return null

  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]))

  if (editing) {
    return (
      <>
        <TopBar title="Editar venda" back />
        <PageContainer>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Data da venda" type="date" {...register('sold_on')} />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Cliente</label>
              <select
                {...register('customer_id' as keyof SaleFormData)}
                defaultValue={selling.customer_id ?? ''}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="">Sem cliente</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Card padding="sm">
              <p className="mb-3 text-sm font-medium text-gray-700">Produtos</p>
              <div className="flex flex-col gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`products.${index}.product_id`}
                        render={({ field }) => (
                          <Combobox
                            options={productOptions}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              handleProductChange(index, value)
                            }}
                            placeholder="Selecionar produto"
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
                        error={errors.products?.[index]?.quantity?.message}
                        {...register(`products.${index}.quantity`)}
                      />
                      <Input
                        placeholder="Preço unit. R$"
                        type="number"
                        step="0.01"
                        error={errors.products?.[index]?.unit_price?.message}
                        {...register(`products.${index}.unit_price`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => append({ product_id: '', quantity: '', unit_price: '' })}
                className="mt-3 w-full"
              >
                <Plus size={16} /> Adicionar produto
              </Button>
            </Card>

            <Card padding="sm" className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Total da venda</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(total)}</p>
            </Card>

            <Textarea
              label="Observações (opcional)"
              placeholder="Nome do cliente, informações adicionais..."
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
      <TopBar title="Detalhes da venda" back />
      <PageContainer>
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-center justify-between flex-1">
                <div>
                  <p className="text-xs text-gray-400">Data</p>
                  <p className="font-medium text-gray-900">{formatDate(selling.sold_on)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(selling.total_amount)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={startEdit} className="ml-3 shrink-0">
                Editar
              </Button>
            </div>
            {selling.customer_id && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">Cliente</p>
                <p className="font-medium text-gray-900">
                  <CustomerName id={selling.customer_id} />
                </p>
              </div>
            )}
            {selling.notes && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">Observações</p>
                <p className="text-sm text-gray-600">{selling.notes}</p>
              </div>
            )}
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium text-gray-700">Produtos vendidos</p>
            <div className="flex flex-col gap-2">
              {selling.products.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">
                      {productMap[item.product_id] ?? item.product_id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(String(Number(item.quantity) * Number(item.unit_price)))}
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

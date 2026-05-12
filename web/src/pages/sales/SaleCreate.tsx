import { useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useCreateSelling } from '@/hooks/useSellings'
import { useProductList } from '@/hooks/useProducts'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Combobox from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { saleSchema, type SaleFormData } from '@/lib/validators'
import { formatCurrency, today } from '@/lib/formatters'

export default function SaleCreate() {
  const navigate = useNavigate()
  const mutation = useCreateSelling()
  const { data: products = [] } = useProductList()

  const productOptions = useMemo(
    () =>
      products
        .filter((p) => p.is_active)
        .map((p) => ({ value: p.id, label: p.name, sublabel: formatCurrency(p.sale_price) })),
    [products],
  )

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      products: [{ product_id: '', quantity: '', unit_price: '' }],
      sold_on: today(),
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'products' })
  const watchedItems = useWatch({ control, name: 'products' })

  const total = (watchedItems ?? []).reduce((sum, item) => {
    return sum + Number(item?.quantity ?? 0) * Number(item?.unit_price ?? 0)
  }, 0)

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      setValue(`products.${index}.unit_price`, product.sale_price)
    }
  }

  const onSubmit = (data: SaleFormData) => {
    mutation.mutate(
      {
        products: data.products.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
          unit_price: p.unit_price,
        })),
        sold_on: data.sold_on ?? null,
        notes: data.notes ?? null,
      },
      { onSuccess: () => navigate(-1) },
    )
  }

  return (
    <>
      <TopBar title="Nova Venda" back />
      <PageContainer>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Data da venda"
            type="date"
            {...register('sold_on')}
          />

          <Card padding="sm">
            <p className="mb-3 text-sm font-medium text-gray-700">Produtos</p>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
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

          {mutation.error && (
            <p className="text-sm text-red-500">Erro ao registrar venda.</p>
          )}

          <Button type="submit" loading={mutation.isPending} className="w-full">
            Registrar venda
          </Button>
        </form>
      </PageContainer>
    </>
  )
}

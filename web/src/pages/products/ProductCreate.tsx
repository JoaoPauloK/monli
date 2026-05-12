import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useCreateProduct } from '@/hooks/useProducts'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { productSchema, type ProductFormData } from '@/lib/validators'

export default function ProductCreate() {
  const navigate = useNavigate()
  const mutation = useCreateProduct()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) })

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(
      { name: data.name, description: data.description, sale_price: data.sale_price },
      { onSuccess: (product) => navigate(`/products/${product.id}`) },
    )
  }

  return (
    <>
      <TopBar title="Novo Produto" back />
      <PageContainer>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome do produto"
            placeholder="Ex: Bolo de chocolate"
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Descrição (opcional)"
            placeholder="Descreva seu produto..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
          <Input
            label="Preço de venda (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.sale_price?.message}
            {...register('sale_price')}
          />

          {mutation.error && (
            <p className="text-sm text-red-500">
              {(mutation.error as { response?: { data?: { detail?: string } } }).response?.data
                ?.detail ?? 'Erro ao criar produto.'}
            </p>
          )}

          <Button type="submit" loading={mutation.isPending} className="mt-2 w-full">
            Criar produto
          </Button>
        </form>
      </PageContainer>
    </>
  )
}

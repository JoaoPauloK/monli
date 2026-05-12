import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useCreateSupplier } from '@/hooks/useSuppliers'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { supplierSchema, type SupplierFormData } from '@/lib/validators'

export default function SupplierCreate() {
  const navigate = useNavigate()
  const mutation = useCreateSupplier()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({ resolver: zodResolver(supplierSchema) })

  const onSubmit = (data: SupplierFormData) => {
    mutation.mutate(data, { onSuccess: (s) => navigate(`/suppliers/${s.id}`) })
  }

  return (
    <>
      <TopBar title="Novo Fornecedor" back />
      <PageContainer>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome"
            placeholder="Ex: Distribuidora Central"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="E-mail (opcional)"
            type="email"
            placeholder="contato@fornecedor.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Telefone (opcional)"
            placeholder="(11) 99999-9999"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Textarea
            label="Observações (opcional)"
            placeholder="Prazo de entrega, condições..."
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />

          {mutation.error && <p className="text-sm text-red-500">Erro ao criar fornecedor.</p>}

          <Button type="submit" loading={mutation.isPending} className="mt-2 w-full">
            Criar fornecedor
          </Button>
        </form>
      </PageContainer>
    </>
  )
}

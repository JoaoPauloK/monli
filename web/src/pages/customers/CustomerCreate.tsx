import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useCreateCustomer } from '@/hooks/useCustomers'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { customerSchema, type CustomerFormData } from '@/lib/validators'

export default function CustomerCreate() {
  const navigate = useNavigate()
  const mutation = useCreateCustomer()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) })

  const onSubmit = (data: CustomerFormData) => {
    mutation.mutate(data, { onSuccess: (c) => navigate(`/customers/${c.id}`) })
  }

  return (
    <>
      <TopBar title="Novo Cliente" back />
      <PageContainer>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome"
            placeholder="Ex: João da Silva"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="E-mail (opcional)"
            type="email"
            placeholder="joao@email.com"
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
            placeholder="Preferências, endereço..."
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />

          {mutation.error && <p className="text-sm text-red-500">Erro ao criar cliente.</p>}

          <Button type="submit" loading={mutation.isPending} className="mt-2 w-full">
            Criar cliente
          </Button>
        </form>
      </PageContainer>
    </>
  )
}

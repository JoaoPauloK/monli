import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useCreateIngredient } from '@/hooks/useIngredients'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Combobox from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { ingredientSchema, type IngredientFormData } from '@/lib/validators'

const unitOptions = ['kg', 'g', 'L', 'ml', 'un', 'cx', 'pacote', 'dúzia'].map((u) => ({
  value: u,
  label: u,
}))

export default function IngredientCreate() {
  const navigate = useNavigate()
  const mutation = useCreateIngredient()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IngredientFormData>({ resolver: zodResolver(ingredientSchema) })

  const onSubmit = (data: IngredientFormData) => {
    mutation.mutate(
      { name: data.name, unit: data.unit, unit_cost: data.unit_cost },
      { onSuccess: (ing) => navigate(`/ingredients/${ing.id}`) },
    )
  }

  return (
    <>
      <TopBar title="Novo Ingrediente" back />
      <PageContainer>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nome do ingrediente"
            placeholder="Ex: Farinha de trigo"
            error={errors.name?.message}
            {...register('name')}
          />
          <Controller
            control={control}
            name="unit"
            render={({ field }) => (
              <Combobox
                label="Unidade"
                options={unitOptions}
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="Selecionar ou digitar unidade"
                allowCustom
                error={errors.unit?.message}
              />
            )}
          />
          <Input
            label="Custo por unidade (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.unit_cost?.message}
            {...register('unit_cost')}
          />

          {mutation.error && (
            <p className="text-sm text-red-500">Erro ao criar ingrediente.</p>
          )}

          <Button type="submit" loading={mutation.isPending} className="mt-2 w-full">
            Criar ingrediente
          </Button>
        </form>
      </PageContainer>
    </>
  )
}

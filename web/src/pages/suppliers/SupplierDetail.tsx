// Copyright (c) 2026 Monli. All rights reserved.
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, Trash2 } from 'lucide-react'
import { useDeleteSupplier, useSupplier, useUpdateSupplier } from '@/hooks/useSuppliers'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import Textarea from '@/components/ui/Textarea'
import { ROUTES } from '@/constants'
import { supplierSchema, type SupplierFormData } from '@/lib/validators'

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: supplier, isLoading } = useSupplier(id!)
  const updateMutation = useUpdateSupplier(id!)
  const deleteMutation = useDeleteSupplier()
  const [editing, setEditing] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({ resolver: zodResolver(supplierSchema) })

  const startEdit = () => {
    reset({
      name: supplier!.name,
      email: supplier!.email ?? '',
      phone: supplier!.phone ?? '',
      notes: supplier!.notes ?? '',
    })
    setEditing(true)
  }

  const onSubmit = (data: SupplierFormData) => {
    updateMutation.mutate(data, { onSuccess: () => setEditing(false) })
  }

  const handleDelete = () => {
    if (!confirm('Excluir este fornecedor?')) return
    deleteMutation.mutate(id!, { onSuccess: () => navigate(ROUTES.SUPPLIERS) })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!supplier) return null

  return (
    <>
      <TopBar title={supplier.name} back />
      <PageContainer>
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[2fr_1fr] lg:items-start lg:gap-6">
          <div>
            {editing ? (
              <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <Input
                    label="Nome"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Telefone"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Textarea
                    label="Observações"
                    rows={3}
                    error={errors.notes?.message}
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
              </Card>
            ) : (
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {supplier.email}
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        {supplier.phone}
                      </div>
                    )}
                    {!supplier.email && !supplier.phone && (
                      <p className="text-sm text-gray-400">Sem contato cadastrado</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={startEdit}>
                    Editar
                  </Button>
                </div>
                {supplier.notes && (
                  <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-500">
                    {supplier.notes}
                  </p>
                )}
              </Card>
            )}
          </div>

          <div>
            <Button
              variant="danger"
              className="w-full"
              loading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              <Trash2 size={16} /> Excluir fornecedor
            </Button>
          </div>
        </div>
      </PageContainer>
    </>
  )
}

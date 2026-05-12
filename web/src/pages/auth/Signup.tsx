import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser } from '@/api/services/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ROUTES } from '@/constants'
import { signupSchema, type SignupFormData } from '@/lib/validators'
import { useAuthStore } from '@/store/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (user) => {
      setUser(user)
      navigate(ROUTES.DASHBOARD, { replace: true })
    },
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
        <p className="mt-1 text-sm text-gray-500">Comece gratuitamente hoje</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {mutation.error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {(mutation.error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
              'Ocorreu um erro. Tente novamente.'}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <Input
            label="Seu nome"
            placeholder="João Silva"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="joao@empresa.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="border-t border-gray-100 pt-2">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
              Dados da empresa
            </p>
            <div className="flex flex-col gap-4">
              <Input
                label="Nome da empresa"
                placeholder="Minha Padaria"
                error={errors.tenant_name?.message}
                {...register('tenant_name')}
              />
              <Input
                label="Identificador único"
                placeholder="minha-padaria"
                error={errors.tenant_slug?.message}
                {...register('tenant_slug')}
              />
              <p className="text-xs text-gray-400">
                Use apenas letras minúsculas, números e hífens. Será usado para acessar sua conta.
              </p>
            </div>
          </div>

          <Button type="submit" loading={mutation.isPending} className="mt-2 w-full">
            Criar conta
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '@/api/services/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ROUTES } from '@/constants'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
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
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-gray-500">Entre com sua conta</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {mutation.error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {(mutation.error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
              String(mutation.error)}
          </div>
        )}

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
          <Input
            label="Identificador da empresa"
            placeholder="minha-padaria"
            error={errors.tenant_slug?.message}
            {...register('tenant_slug')}
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
            placeholder="Sua senha"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" loading={mutation.isPending} className="mt-2 w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Não tem uma conta?{' '}
          <Link to={ROUTES.SIGNUP} className="font-medium text-brand hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}

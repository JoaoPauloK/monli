import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

export default function AuthGuard() {
  const { isLoading, isError } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          role="status"
          aria-label="Carregando"
          className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"
        />
      </div>
    )
  }

  if (isError) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}

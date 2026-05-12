import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'

export default function GuestGuard() {
  const user = useAuthStore((s) => s.user)

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}

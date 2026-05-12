import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, LogOut, Settings } from 'lucide-react'
import { logout } from '@/api/services/auth'
import { ROUTES } from '@/constants'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'

interface TopBarProps {
  title: string
  back?: boolean
  action?: ReactNode
}

function UserMenu() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser()
      queryClient.clear()
      navigate(ROUTES.HOME, { replace: true })
    },
  })

  if (!user) return null

  const initials = user.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-xs font-semibold hover:opacity-90 transition-opacity"
        aria-label="Menu do usuário"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[180px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="truncate text-sm font-medium text-gray-900">{user.full_name}</p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); navigate(ROUTES.SETTINGS) }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings size={15} />
            Configurações
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut size={15} />
            {logoutMutation.isPending ? 'Saindo…' : 'Sair'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function TopBar({ title, back, action }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-100 bg-white px-4 lg:h-16 lg:px-10">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="flex-1 text-base font-semibold text-gray-900 lg:text-xl lg:font-bold">{title}</h1>
      <div className="flex items-center gap-2">
        {action}
        <UserMenu />
      </div>
    </header>
  )
}

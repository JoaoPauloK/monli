import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, ChevronRight, Download, FileText, LogOut, Truck, User, Users } from 'lucide-react'
import { logout } from '@/api/services/auth'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { ROUTES } from '@/constants'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'

export default function Settings() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const deferredPrompt = useRef<Event & { prompt: () => Promise<void> } | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as Event & { prompt: () => Promise<void> }
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser()
      queryClient.clear()
      navigate(ROUTES.HOME, { replace: true })
    },
  })

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt()
      deferredPrompt.current = null
      setCanInstall(false)
    }
  }

  return (
    <>
      <TopBar title="Configurações" />
      <PageContainer>
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
                <User size={22} className="text-brand" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.full_name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <Building2 size={22} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Empresa</p>
                <p className="font-medium text-gray-900">ID: {user?.tenant_id.slice(0, 8)}…</p>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <p className="mb-1 px-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Ferramentas</p>
            <Link
              to={ROUTES.BUDGET}
              className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                <FileText size={18} className="text-blue-500" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900">Orçamento</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          </Card>

          <Card padding="sm">
            <p className="mb-1 px-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Cadastros</p>
            <Link
              to={ROUTES.SUPPLIERS}
              className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                <Truck size={18} className="text-orange-500" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900">Fornecedores</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
            <Link
              to={ROUTES.CUSTOMERS}
              className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                <Users size={18} className="text-purple-500" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900">Clientes</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          </Card>

          {canInstall && (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                    <Download size={22} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instalar app</p>
                    <p className="text-sm text-gray-500">Adicionar à tela inicial</p>
                  </div>
                </div>
                <Button size="sm" onClick={handleInstall}>
                  Instalar
                </Button>
              </div>
            </Card>
          )}

          <Button
            variant="danger"
            className="w-full"
            loading={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut size={16} /> Sair
          </Button>

          <p className="text-center text-xs text-gray-400">Monli v0.1.0</p>
        </div>
      </PageContainer>
    </>
  )
}

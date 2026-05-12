// Copyright (c) 2026 Monli. All rights reserved.
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useIngredientList } from '@/hooks/useIngredients'
import { useProductList } from '@/hooks/useProducts'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import LowStockAlert from '@/components/shared/LowStockAlert'
import StatCard from '@/components/shared/StatCard'
import { ROUTES } from '@/constants'
import { calcMargin, formatCurrency, formatPercent } from '@/lib/formatters'
import { useAuthStore } from '@/store/authStore'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: products = [] } = useProductList()
  const { data: ingredients = [] } = useIngredientList()

  const stats = useMemo(() => {
    const activeProducts = products.filter((p) => p.is_active)
    const totalRevenuePotential = activeProducts.reduce(
      (sum, p) => sum + Number(p.sale_price),
      0,
    )
    const totalCost = activeProducts.reduce((sum, p) => sum + Number(p.estimated_cost), 0)
    const avgMargin =
      activeProducts.length > 0
        ? activeProducts.reduce((sum, p) => sum + calcMargin(p.sale_price, p.estimated_cost), 0) /
          activeProducts.length
        : 0

    return { activeProducts, totalRevenuePotential, totalCost, avgMargin, ingredients }
  }, [products, ingredients])

  const navigate = useNavigate()
  const firstName = user?.full_name.split(' ')[0] ?? 'você'

  return (
    <>
      <TopBar title={`Olá, ${firstName}!`} />
      <PageContainer>
        <LowStockAlert />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            label="Produtos ativos"
            value={String(stats.activeProducts.length)}
            Icon={ShoppingBag}
          />
          <StatCard
            label="Ingredientes"
            value={String(stats.ingredients.length)}
            Icon={Package}
            iconColor="text-blue-500"
          />
          <StatCard
            label="Preço médio"
            value={
              stats.activeProducts.length > 0
                ? formatCurrency(stats.totalRevenuePotential / stats.activeProducts.length)
                : 'R$ 0,00'
            }
            Icon={TrendingUp}
            iconColor="text-green-500"
          />
          <StatCard
            label="Margem média"
            value={formatPercent(stats.avgMargin)}
            Icon={TrendingDown}
            iconColor={stats.avgMargin >= 0.3 ? 'text-green-500' : 'text-yellow-500'}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:mt-8 lg:grid lg:grid-cols-[2fr_1fr] lg:items-start lg:gap-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 lg:text-base">Produtos recentes</h2>
              <Link
                to={ROUTES.PRODUCTS}
                className="flex items-center gap-1 text-xs font-medium text-brand"
              >
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {products.slice(0, 3).length === 0 ? (
              <Card>
                <p className="text-center text-sm text-gray-400">Nenhum produto cadastrado</p>
              </Card>
            ) : (
              <>
                {/* Mobile: show 3 */}
                <div className="flex flex-col gap-2 lg:hidden">
                  {products.slice(0, 3).map((p) => (
                    <Link key={p.id} to={`/products/${p.id}`}>
                      <Card
                        padding="sm"
                        className="flex items-center justify-between transition-all hover:shadow-md active:scale-[0.98]"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">
                            Custo: {formatCurrency(p.estimated_cost)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(p.sale_price)}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatPercent(calcMargin(p.sale_price, p.estimated_cost))}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Desktop: table view, show 5 */}
                <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Produto</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Preço</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Margem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.slice(0, 5).map((p) => {
                        const margin = calcMargin(p.sale_price, p.estimated_cost)
                        return (
                          <tr
                            key={p.id}
                            className="cursor-pointer transition-colors hover:bg-gray-50"
                            onClick={() => navigate(`/products/${p.id}`)}
                          >
                            <td className="px-5 py-3.5 font-medium text-gray-900">{p.name}</td>
                            <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                              {formatCurrency(p.sale_price)}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Badge color={margin >= 0.3 ? 'green' : margin >= 0.1 ? 'yellow' : 'red'}>
                                {formatPercent(margin)}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4">
            <Link to={ROUTES.PURCHASE_NEW}>
              <Card className="flex flex-col items-center gap-2 py-5 text-center transition-all hover:shadow-md active:scale-[0.98] lg:flex-row lg:gap-3 lg:py-4 lg:text-left lg:px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <TrendingDown size={20} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Nova Compra</p>
                  <p className="hidden text-xs text-gray-400 lg:block">Registrar ingredientes</p>
                </div>
              </Card>
            </Link>
            <Link to={ROUTES.SALE_NEW}>
              <Card className="flex flex-col items-center gap-2 py-5 text-center transition-all hover:shadow-md active:scale-[0.98] lg:flex-row lg:gap-3 lg:py-4 lg:text-left lg:px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <TrendingUp size={20} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Nova Venda</p>
                  <p className="hidden text-xs text-gray-400 lg:block">Registrar pedido</p>
                </div>
              </Card>
            </Link>
            <Link to={ROUTES.BUDGET} className="lg:col-span-1">
              <Card className="flex flex-col items-center gap-2 py-5 text-center transition-all hover:shadow-md active:scale-[0.98] lg:flex-row lg:gap-3 lg:py-4 lg:text-left lg:px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <FileText size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Orçamento</p>
                  <p className="hidden text-xs text-gray-400 lg:block">Criar e compartilhar</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </PageContainer>
    </>
  )
}

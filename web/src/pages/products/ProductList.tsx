// Copyright (c) 2026 Monli. All rights reserved.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, ShoppingBag } from 'lucide-react'
import { useProductList } from '@/hooks/useProducts'
import { useFuzzySearch } from '@/hooks/useFuzzySearch'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/shared/EmptyState'
import SearchInput from '@/components/shared/SearchInput'
import { ROUTES } from '@/constants'
import { calcMargin, formatCurrency, formatPercent } from '@/lib/formatters'

const SEARCH_OPTIONS = { keys: ['name', 'description'] }

export default function ProductList() {
  const navigate = useNavigate()
  const { data: products = [], isLoading } = useProductList()
  const [query, setQuery] = useState('')
  const filtered = useFuzzySearch(products, query, SEARCH_OPTIONS)

  return (
    <>
      <TopBar
        title="Produtos"
        action={
          <Link to={ROUTES.PRODUCT_NEW}>
            <Button size="sm">
              <Plus size={16} /> Novo
            </Button>
          </Link>
        }
      />
      <PageContainer>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            Icon={ShoppingBag}
            title="Nenhum produto"
            description="Cadastre seu primeiro produto"
          />
        ) : (
          <>
            <SearchInput value={query} onChange={setQuery} className="mb-4" />

            {filtered.length === 0 ? (
              <EmptyState
                Icon={ShoppingBag}
                title="Nenhum resultado"
                description={`Nenhum produto encontrado para "${query}"`}
              />
            ) : (
              <>
                {/* Mobile: card stack */}
                <div className="flex flex-col gap-3 lg:hidden">
                  {filtered.map((p) => {
                    const margin = calcMargin(p.sale_price, p.estimated_cost)
                    return (
                      <Link key={p.id} to={`/products/${p.id}`}>
                        <Card className="transition-all hover:shadow-md active:scale-[0.98]">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{p.name}</p>
                              {p.description && (
                                <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{p.description}</p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <Badge color={p.is_active ? 'green' : 'gray'}>
                                  {p.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                                <Badge color={margin >= 0.3 ? 'green' : margin >= 0.1 ? 'yellow' : 'red'}>
                                  {formatPercent(margin)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{formatCurrency(p.sale_price)}</p>
                              <p className="text-xs text-gray-400">
                                Custo: {formatCurrency(p.estimated_cost)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>

                {/* Desktop: data table */}
                <div className="hidden lg:block">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Produto</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Descrição</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Preço</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Custo</th>
                          <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Margem</th>
                          <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((p) => {
                          const margin = calcMargin(p.sale_price, p.estimated_cost)
                          return (
                            <tr
                              key={p.id}
                              className="cursor-pointer transition-colors hover:bg-gray-50"
                              onClick={() => navigate(`/products/${p.id}`)}
                            >
                              <td className="px-5 py-4 font-medium text-gray-900">{p.name}</td>
                              <td className="max-w-xs px-5 py-4 truncate text-gray-400">
                                {p.description || <span className="text-gray-200">—</span>}
                              </td>
                              <td className="px-5 py-4 text-right font-semibold text-gray-900">
                                {formatCurrency(p.sale_price)}
                              </td>
                              <td className="px-5 py-4 text-right text-gray-500">
                                {formatCurrency(p.estimated_cost)}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <Badge color={margin >= 0.3 ? 'green' : margin >= 0.1 ? 'yellow' : 'red'}>
                                  {formatPercent(margin)}
                                </Badge>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <Badge color={p.is_active ? 'green' : 'gray'}>
                                  {p.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </PageContainer>
    </>
  )
}

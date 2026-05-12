// Copyright (c) 2026 Monli. All rights reserved.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Plus } from 'lucide-react'
import { usePurchasesList } from '@/hooks/usePurchases'
import { useFuzzySearch } from '@/hooks/useFuzzySearch'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/shared/EmptyState'
import SearchInput from '@/components/shared/SearchInput'
import { ROUTES } from '@/constants'
import { formatCurrency, formatDate } from '@/lib/formatters'

const SEARCH_OPTIONS = { keys: ['purchased_on', 'notes', 'supplier.name'] }

export default function PurchaseList() {
  const navigate = useNavigate()
  const { data: purchases = [], isLoading } = usePurchasesList()
  const [query, setQuery] = useState('')
  const filtered = useFuzzySearch(purchases, query, SEARCH_OPTIONS)

  return (
    <>
      <TopBar
        title="Compras"
        action={
          <Link to={ROUTES.PURCHASE_NEW}>
            <Button size="sm">
              <Plus size={16} /> Nova
            </Button>
          </Link>
        }
      />
      <PageContainer>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : purchases.length === 0 ? (
          <EmptyState
            Icon={Package}
            title="Registre compras de ingredientes"
            description="Cada compra atualiza o estoque automaticamente"
          />
        ) : (
          <>
            <SearchInput value={query} onChange={setQuery} className="mb-4" />

            {filtered.length === 0 ? (
              <EmptyState
                Icon={Package}
                title="Nenhum resultado"
                description={`Nenhuma compra encontrada para "${query}"`}
              />
            ) : (
              <>
                {/* Mobile: card stack */}
                <div className="flex flex-col gap-3 lg:hidden">
                  {filtered.map((p) => (
                    <Link key={p.id} to={`/purchases/${p.id}`}>
                      <Card className="flex items-center justify-between transition-all hover:shadow-md active:scale-[0.98]">
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(p.purchased_on)}</p>
                          {p.notes && <p className="text-xs text-gray-400 line-clamp-1">{p.notes}</p>}
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(p.total_amount)}</p>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Desktop: data table */}
                <div className="hidden lg:block">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Data</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Fornecedor</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Valor total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((p) => (
                          <tr
                            key={p.id}
                            className="cursor-pointer transition-colors hover:bg-gray-50"
                            onClick={() => navigate(`/purchases/${p.id}`)}
                          >
                            <td className="px-5 py-4 font-medium text-gray-900">{formatDate(p.purchased_on)}</td>
                            <td className="px-5 py-4 text-gray-500">
                              {p.supplier?.name || <span className="text-gray-200">—</span>}
                            </td>
                            <td className="px-5 py-4 text-right font-semibold text-gray-900">
                              {formatCurrency(p.total_amount)}
                            </td>
                          </tr>
                        ))}
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

// Copyright (c) 2026 Monli. All rights reserved.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Truck } from 'lucide-react'
import { useSupplierList } from '@/hooks/useSuppliers'
import { useFuzzySearch } from '@/hooks/useFuzzySearch'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/shared/EmptyState'
import SearchInput from '@/components/shared/SearchInput'
import { ROUTES } from '@/constants'

const SEARCH_OPTIONS = { keys: ['name', 'email', 'phone'] }

export default function SupplierList() {
  const navigate = useNavigate()
  const { data: suppliers = [], isLoading } = useSupplierList()
  const [query, setQuery] = useState('')
  const filtered = useFuzzySearch(suppliers, query, SEARCH_OPTIONS)

  return (
    <>
      <TopBar
        title="Fornecedores"
        action={
          <Link to={ROUTES.SUPPLIER_NEW}>
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
        ) : suppliers.length === 0 ? (
          <EmptyState
            Icon={Truck}
            title="Nenhum fornecedor"
            description="Cadastre seu primeiro fornecedor"
          />
        ) : (
          <>
            <SearchInput value={query} onChange={setQuery} className="mb-4" />

            {filtered.length === 0 ? (
              <EmptyState
                Icon={Truck}
                title="Nenhum resultado"
                description={`Nenhum fornecedor encontrado para "${query}"`}
              />
            ) : (
              <>
                {/* Mobile: card stack */}
                <div className="flex flex-col gap-3 lg:hidden">
                  {filtered.map((s) => (
                    <Link key={s.id} to={`/suppliers/${s.id}`}>
                      <Card className="transition-all hover:shadow-md active:scale-[0.98]">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <div className="mt-1 flex gap-3 text-xs text-gray-400">
                          {s.email && <span>{s.email}</span>}
                          {s.phone && <span>{s.phone}</span>}
                          {!s.email && !s.phone && <span>Sem contato cadastrado</span>}
                        </div>
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
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Nome</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">E-mail</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Telefone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((s) => (
                          <tr
                            key={s.id}
                            className="cursor-pointer transition-colors hover:bg-gray-50"
                            onClick={() => navigate(`/suppliers/${s.id}`)}
                          >
                            <td className="px-5 py-4 font-medium text-gray-900">{s.name}</td>
                            <td className="px-5 py-4 text-gray-500">
                              {s.email || <span className="text-gray-200">—</span>}
                            </td>
                            <td className="px-5 py-4 text-gray-500">
                              {s.phone || <span className="text-gray-200">—</span>}
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

// Copyright (c) 2026 Monli. All rights reserved.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Wheat } from 'lucide-react'
import { useIngredientList } from '@/hooks/useIngredients'
import { useFuzzySearch } from '@/hooks/useFuzzySearch'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/shared/EmptyState'
import SearchInput from '@/components/shared/SearchInput'
import { ROUTES } from '@/constants'
import { formatCurrency } from '@/lib/formatters'

const SEARCH_OPTIONS = { keys: ['name', 'unit'] }

export default function IngredientList() {
  const navigate = useNavigate()
  const { data: ingredients = [], isLoading } = useIngredientList()
  const [query, setQuery] = useState('')
  const filtered = useFuzzySearch(ingredients, query, SEARCH_OPTIONS)

  return (
    <>
      <TopBar
        title="Ingredientes"
        action={
          <Link to={ROUTES.INGREDIENT_NEW}>
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
        ) : ingredients.length === 0 ? (
          <EmptyState
            Icon={Wheat}
            title="Nenhum ingrediente"
            description="Cadastre seu primeiro ingrediente"
          />
        ) : (
          <>
            <SearchInput value={query} onChange={setQuery} className="mb-4" />

            {filtered.length === 0 ? (
              <EmptyState
                Icon={Wheat}
                title="Nenhum resultado"
                description={`Nenhum ingrediente encontrado para "${query}"`}
              />
            ) : (
              <>
                {/* Mobile: card stack */}
                <div className="flex flex-col gap-3 lg:hidden">
                  {filtered.map((ing) => (
                    <Link key={ing.id} to={`/ingredients/${ing.id}`}>
                      <Card className="flex items-center justify-between transition-all hover:shadow-md active:scale-[0.98]">
                        <div>
                          <p className="font-medium text-gray-900">{ing.name}</p>
                          <p className="text-xs text-gray-400">Unidade: {ing.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(ing.unit_cost)}</p>
                          <p className="text-xs text-gray-400">por {ing.unit}</p>
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
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Ingrediente</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Unidade</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Custo por unidade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((ing) => (
                          <tr
                            key={ing.id}
                            className="cursor-pointer transition-colors hover:bg-gray-50"
                            onClick={() => navigate(`/ingredients/${ing.id}`)}
                          >
                            <td className="px-5 py-4 font-medium text-gray-900">{ing.name}</td>
                            <td className="px-5 py-4 text-gray-500">{ing.unit}</td>
                            <td className="px-5 py-4 text-right font-semibold text-gray-900">
                              {formatCurrency(ing.unit_cost)}
                              <span className="ml-1 text-xs font-normal text-gray-400">/{ing.unit}</span>
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

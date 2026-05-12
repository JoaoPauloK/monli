import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useProductList } from '@/hooks/useProducts'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { BRAND } from '@/constants'
import { calcMargin, formatCurrency, formatPercent } from '@/lib/formatters'

export default function Reports() {
  const { data: products = [], isLoading } = useProductList()

  const chartData = useMemo(
    () =>
      products
        .filter((p) => p.is_active)
        .map((p) => ({
          name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
          preco: Number(p.sale_price),
          custo: Number(p.estimated_cost),
          margem: Math.round(calcMargin(p.sale_price, p.estimated_cost) * 100),
        })),
    [products],
  )

  const totals = useMemo(() => {
    const active = products.filter((p) => p.is_active)
    return {
      avgPrice: active.length
        ? active.reduce((s, p) => s + Number(p.sale_price), 0) / active.length
        : 0,
      avgCost: active.length
        ? active.reduce((s, p) => s + Number(p.estimated_cost), 0) / active.length
        : 0,
      avgMargin: active.length
        ? active.reduce((s, p) => s + calcMargin(p.sale_price, p.estimated_cost), 0) /
          active.length
        : 0,
    }
  }, [products])

  return (
    <>
      <TopBar title="Relatórios" />
      <PageContainer>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Preço médio', value: formatCurrency(totals.avgPrice) },
                { label: 'Custo médio', value: formatCurrency(totals.avgCost) },
                { label: 'Margem média', value: formatPercent(totals.avgMargin) },
              ].map(({ label, value }) => (
                <Card key={label} padding="sm" className="text-center">
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{label}</p>
                </Card>
              ))}
            </div>

            {chartData.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <p className="mb-4 text-sm font-semibold text-gray-700">
                    Preço vs Custo por produto
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barSize={16} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                        labelStyle={{ fontWeight: 600 }}
                      />
                      <Bar dataKey="preco" name="Preço" fill={BRAND.PRIMARY} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="custo" name="Custo" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <p className="mb-4 text-sm font-semibold text-gray-700">Margem por produto (%)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey="margem" name="Margem" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.margem >= 30 ? '#16a34a' : entry.margem >= 10 ? '#ca8a04' : '#dc2626'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            )}

            <Card>
              <p className="mb-3 text-sm font-semibold text-gray-700">Todos os produtos</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Produto</th>
                      <th className="pb-2 text-right text-xs font-medium text-gray-500">Preço</th>
                      <th className="pb-2 text-right text-xs font-medium text-gray-500">Custo</th>
                      <th className="pb-2 text-right text-xs font-medium text-gray-500">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 text-gray-800">{p.name}</td>
                        <td className="py-2 text-right font-medium">{formatCurrency(p.sale_price)}</td>
                        <td className="py-2 text-right text-gray-500">{formatCurrency(p.estimated_cost)}</td>
                        <td
                          className={`py-2 text-right font-medium ${
                            calcMargin(p.sale_price, p.estimated_cost) >= 0.3
                              ? 'text-green-600'
                              : calcMargin(p.sale_price, p.estimated_cost) >= 0.1
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {formatPercent(calcMargin(p.sale_price, p.estimated_cost))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </PageContainer>
    </>
  )
}

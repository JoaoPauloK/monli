const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const percent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatCurrency(value: number | string): string {
  return currency.format(Number(value))
}

export function formatPercent(value: number): string {
  return percent.format(value)
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso + 'T00:00:00'))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function calcMargin(salePrice: string, estimatedCost: string): number {
  const price = Number(salePrice)
  const cost = Number(estimatedCost)
  if (price === 0) return 0
  return (price - cost) / price
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

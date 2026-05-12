import { AlertTriangle } from 'lucide-react'
import { useLowStock } from '@/hooks/useInventory'

export default function LowStockAlert() {
  const { data: items } = useLowStock()

  if (!items?.length) return null

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-yellow-600" />
      <div>
        <p className="text-sm font-medium text-yellow-800">
          {items.length} {items.length === 1 ? 'item' : 'itens'} com estoque baixo
        </p>
        <p className="text-xs text-yellow-600">Verifique o estoque para evitar interrupções</p>
      </div>
    </div>
  )
}

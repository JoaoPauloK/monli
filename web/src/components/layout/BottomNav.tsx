import { NavLink } from 'react-router-dom'
import { BarChart3, LayoutDashboard, Package, ShoppingBag, TrendingUp, Wheat } from 'lucide-react'
import { ROUTES } from '@/constants'

const tabs = [
  { to: ROUTES.DASHBOARD, label: 'Início', Icon: LayoutDashboard },
  { to: ROUTES.PRODUCTS, label: 'Produtos', Icon: ShoppingBag },
  { to: ROUTES.INGREDIENTS, label: 'Ingredientes', Icon: Wheat },
  { to: ROUTES.PURCHASES, label: 'Compras', Icon: Package },
  { to: ROUTES.SALES, label: 'Vendas', Icon: TrendingUp },
  { to: ROUTES.REPORTS, label: 'Relatórios', Icon: BarChart3 },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white pb-safe lg:hidden">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

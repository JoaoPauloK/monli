// Copyright (c) 2026 Monli. All rights reserved.
import { NavLink } from 'react-router-dom'
import { BarChart3, LayoutDashboard, Package, Settings, ShoppingBag, TrendingUp, Wheat } from 'lucide-react'
import { ROUTES } from '@/constants'

const tabs = [
  { to: ROUTES.DASHBOARD, label: 'Início', Icon: LayoutDashboard },
  { to: ROUTES.PRODUCTS, label: 'Produtos', Icon: ShoppingBag },
  { to: ROUTES.INGREDIENTS, label: 'Ingredientes', Icon: Wheat },
  { to: ROUTES.PURCHASES, label: 'Compras', Icon: Package },
  { to: ROUTES.SALES, label: 'Vendas', Icon: TrendingUp },
  { to: ROUTES.REPORTS, label: 'Relatórios', Icon: BarChart3 },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand/10 text-brand'
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
  }`

export default function SideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-gray-100 bg-white lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-5">
        <div>
          <span className="text-xl font-bold text-brand">Monli</span>
          <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">Gestão financeira</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pt-4">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon size={20} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-100 p-3">
        <NavLink to={ROUTES.SETTINGS} className={navLinkClass}>
          <Settings size={20} strokeWidth={1.75} />
          Configurações
        </NavLink>
      </div>
    </aside>
  )
}

import { Link } from 'react-router-dom'
import { BarChart3, Package, ShoppingBag, Wheat } from 'lucide-react'
import Button from '@/components/ui/Button'
import { ROUTES } from '@/constants'

const features = [
  {
    Icon: ShoppingBag,
    title: 'Gestão de Produtos',
    desc: 'Calcule o custo real de cada produto com base na sua receita.',
  },
  {
    Icon: Wheat,
    title: 'Controle de Ingredientes',
    desc: 'Gerencie o estoque de ingredientes e receba alertas de baixo estoque.',
  },
  {
    Icon: Package,
    title: 'Compras e Vendas',
    desc: 'Registre compras de fornecedores e vendas para clientes com facilidade.',
  },
  {
    Icon: BarChart3,
    title: 'Relatórios Financeiros',
    desc: 'Visualize receita, custos e margem de lucro em tempo real.',
  },
]

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Monli</span>
        </div>
        <Link to={ROUTES.LOGIN}>
          <Button variant="secondary" size="sm">
            Entrar
          </Button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-12 text-center">
        <div className="mb-2 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand">
          Para pequenos negócios alimentícios
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Gestão financeira
          <br />
          <span className="text-brand">simplificada</span>
        </h1>
        <p className="mt-4 max-w-sm text-base text-gray-500">
          Controle custos, estoque e vendas do seu negócio alimentício em um só lugar. Do celular,
          como um app nativo.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to={ROUTES.SIGNUP}>
            <Button size="lg" className="w-full sm:w-auto">
              Começar gratuitamente
            </Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </main>

      <section className="bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-lg">
          <h2 className="mb-8 text-center text-xl font-bold text-gray-900">
            Tudo que você precisa
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
                  <Icon size={18} className="text-brand" />
                </div>
                <p className="mb-1 text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 Monli. Todos os direitos reservados.
      </footer>
    </div>
  )
}

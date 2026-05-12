import type { LucideIcon } from 'lucide-react'
import Card from '@/components/ui/Card'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  Icon: LucideIcon
  iconColor?: string
}

export default function StatCard({ label, value, sub, Icon, iconColor = 'text-brand' }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3 transition-all duration-200 hover:shadow-md active:scale-[0.98]">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </Card>
  )
}

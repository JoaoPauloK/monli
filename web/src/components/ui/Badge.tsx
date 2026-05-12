type BadgeColor = 'green' | 'red' | 'yellow' | 'gray' | 'brand'

const colors: Record<BadgeColor, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  gray: 'bg-gray-100 text-gray-600',
  brand: 'bg-brand-50 text-brand',
}

interface BadgeProps {
  color?: BadgeColor
  children: React.ReactNode
  className?: string
}

export default function Badge({ color = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]} ${className}`}
    >
      {children}
    </span>
  )
}

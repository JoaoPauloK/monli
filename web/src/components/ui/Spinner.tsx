export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-brand ${className}`}
      role="status"
      aria-label="Carregando"
    />
  )
}

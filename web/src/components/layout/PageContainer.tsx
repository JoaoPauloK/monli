import type { HTMLAttributes } from 'react'

export default function PageContainer({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={`mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4 lg:max-w-6xl lg:px-10 lg:pb-12 lg:pt-8 ${className}`} {...props}>
      {children}
    </main>
  )
}

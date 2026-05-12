import { render, screen } from '@testing-library/react'
import { BarChart3 } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import StatCard from '@/components/shared/StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Produtos" value="42" Icon={BarChart3} />)
    expect(screen.getByText('Produtos')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<StatCard label="Margem" value="35%" sub="média" Icon={BarChart3} />)
    expect(screen.getByText('média')).toBeInTheDocument()
  })
})

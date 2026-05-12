import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import AuthGuard from '@/router/guards/AuthGuard'

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

describe('AuthGuard', () => {
  it('shows spinner while loading', () => {
    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<div>Protected</div>} />
            </Route>
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

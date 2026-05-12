import { http, HttpResponse } from 'msw'
import { mockIngredient, mockInventory, mockProduct, mockUser } from './fixtures'

const base = 'http://localhost:8000/api/v1'

export const handlers = [
  http.get(`${base}/auth/me`, () => HttpResponse.json(mockUser)),
  http.post(`${base}/auth/login`, () => HttpResponse.json(mockUser)),
  http.post(`${base}/auth/register`, () => HttpResponse.json(mockUser, { status: 201 })),
  http.post(`${base}/auth/logout`, () => HttpResponse.json({ ok: true })),
  http.post(`${base}/auth/refresh`, () => HttpResponse.json({ ok: true })),

  http.get(`${base}/products`, () => HttpResponse.json([mockProduct])),
  http.post(`${base}/products`, () => HttpResponse.json(mockProduct, { status: 201 })),
  http.get(`${base}/products/:id`, () => HttpResponse.json(mockProduct)),

  http.get(`${base}/ingredients`, () => HttpResponse.json([mockIngredient])),
  http.post(`${base}/ingredients`, () => HttpResponse.json(mockIngredient, { status: 201 })),
  http.get(`${base}/ingredients/:id`, () => HttpResponse.json(mockIngredient)),

  http.get(`${base}/inventory/low-stock`, () => HttpResponse.json([])),
  http.get(`${base}/inventory/ingredients/:id`, () => HttpResponse.json(mockInventory)),
  http.get(`${base}/inventory/products/:id`, () => HttpResponse.json(mockInventory)),

  http.post(`${base}/purchases`, () =>
    HttpResponse.json(
      {
        id: 'aaaa',
        tenant_id: mockUser.tenant_id,
        supplier_id: null,
        purchased_on: new Date().toISOString().split('T')[0],
        total_amount: '50.00',
        notes: null,
      },
      { status: 201 },
    ),
  ),
  http.post(`${base}/sellings`, () =>
    HttpResponse.json(
      {
        id: 'bbbb',
        tenant_id: mockUser.tenant_id,
        customer_id: null,
        sold_on: new Date().toISOString().split('T')[0],
        total_amount: '25.00',
        notes: null,
      },
      { status: 201 },
    ),
  ),
]

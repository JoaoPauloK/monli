export interface CustomerRead {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
}

export interface CustomerCreate {
  name: string
  email?: string | null
  phone?: string | null
  notes?: string | null
}

export interface CustomerUpdate {
  name?: string
  email?: string | null
  phone?: string | null
  notes?: string | null
}

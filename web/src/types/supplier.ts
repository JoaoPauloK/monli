export interface SupplierRead {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
}

export interface SupplierCreate {
  name: string
  email?: string | null
  phone?: string | null
  notes?: string | null
}

export interface SupplierUpdate {
  name?: string
  email?: string | null
  phone?: string | null
  notes?: string | null
}

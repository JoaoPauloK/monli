export interface UserRead {
  id: string
  tenant_id: string
  tenant_name: string
  full_name: string
  email: string
  is_superuser: boolean
}

export interface UserCreate {
  full_name: string
  email: string
  password: string
  tenant_name: string
  tenant_slug: string
}

export interface UserLogin {
  email: string
  password: string
  tenant_slug: string
}

import type { CustomerCreate, CustomerRead, CustomerUpdate } from '@/types/customer'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function listCustomers(): Promise<CustomerRead[]> {
  const res = await apiClient.get<CustomerRead[]>(API.CUSTOMERS.LIST)
  return res.data
}

export async function createCustomer(data: CustomerCreate): Promise<CustomerRead> {
  const res = await apiClient.post<CustomerRead>(API.CUSTOMERS.CREATE, data)
  return res.data
}

export async function getCustomer(id: string): Promise<CustomerRead> {
  const res = await apiClient.get<CustomerRead>(API.CUSTOMERS.GET(id))
  return res.data
}

export async function updateCustomer(id: string, data: CustomerUpdate): Promise<CustomerRead> {
  const res = await apiClient.patch<CustomerRead>(API.CUSTOMERS.UPDATE(id), data)
  return res.data
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(API.CUSTOMERS.DELETE(id))
}

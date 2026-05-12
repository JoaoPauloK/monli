import type { UserCreate, UserLogin, UserRead } from '@/types/auth'
import { apiClient } from '../client'
import { API } from '../endpoints'

export async function register(data: UserCreate): Promise<UserRead> {
  const res = await apiClient.post<UserRead>(API.AUTH.REGISTER, data)
  return res.data
}

export async function login(data: UserLogin): Promise<UserRead> {
  const res = await apiClient.post<UserRead>(API.AUTH.LOGIN, data)
  return res.data
}

export async function logout(): Promise<void> {
  await apiClient.post(API.AUTH.LOGOUT)
}

export async function refresh(): Promise<void> {
  await apiClient.post(API.AUTH.REFRESH)
}

export async function me(): Promise<UserRead> {
  const res = await apiClient.get<UserRead>(API.AUTH.ME)
  return res.data
}

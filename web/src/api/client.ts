import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API } from './endpoints'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: AxiosError | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(null)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const noRefreshPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']
    if (noRefreshPaths.some((path) => original.url?.includes(path))) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => apiClient(original))
    }

    original._retry = true
    isRefreshing = true

    try {
      await apiClient.post(API.AUTH.REFRESH)
      processQueue(null)
      return apiClient(original)
    } catch (refreshError) {
      processQueue(refreshError as AxiosError)
      import('@/store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().clearUser()
      })
      // window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

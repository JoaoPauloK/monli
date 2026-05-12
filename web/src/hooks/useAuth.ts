import { useQuery } from '@tanstack/react-query'
import { me } from '@/api/services/auth'
import { useAuthStore } from '@/store/authStore'

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser)
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: me,
    staleTime: 0,
    retry: false,
    select: (data) => {
      setUser(data)
      return data
    },
  })
}

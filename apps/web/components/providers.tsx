'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setAuthToken } from '@/lib/api'
import { Toaster } from 'sonner'

const AuthSync = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth()

  useEffect(() => {
    const syncToken = async () => {
      const token = await getToken()
      setAuthToken(token)
    }
    syncToken()
  }, [getToken])

  return <>{children}</>
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync>
        {children}
        <Toaster position="top-right" richColors />
      </AuthSync>
    </QueryClientProvider>
  )
}
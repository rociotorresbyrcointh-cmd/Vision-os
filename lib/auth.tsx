'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase-client'

interface User {
  id: string
  email: string
  company: string
  sector: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, company: string, sector: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: config } = await supabase.from('business_config').select('*').eq('user_id', session.user.id).single()
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          company: config?.business_name || '',
          sector: config?.sector || ''
        }
        setUser(userData)
      }
      setLoading(false)
    }
    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) return false

      const { data: config } = await supabase.from('business_config').select('*').eq('user_id', data.user.id).single()
      const userData: User = {
        id: data.user.id,
        email: data.user.email || '',
        company: config?.business_name || '',
        sector: config?.sector || ''
      }
      setUser(userData)
      localStorage.setItem('bos_user', JSON.stringify(userData))
      return true
    } catch {
      return false
    }
  }

  const register = async (email: string, password: string, company: string, sector: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company, sector })
      })

      if (!response.ok) {
        console.error('Registration failed:', response.statusText)
        return false
      }

      const data = await response.json()
      const userData: User = { id: data.user.id, email: email, company: company, sector: sector }
      setUser(userData)
      localStorage.setItem('bos_user', JSON.stringify(userData))
      return true
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('bos_user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

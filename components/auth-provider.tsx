"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getCurrentUser, logoutUser } from "@/lib/auth"

type User = {
  id: string
  email: string
  full_name?: string
  role?: string
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    function loadUser() {
      try {
        const result = getCurrentUser()
        if (result && 'user' in result) {
          setUser(result.user as User)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  async function logout() {
    await logoutUser()
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
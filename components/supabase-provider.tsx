"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { type Session, type SupabaseClient, createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Definir tipo correto para o contexto
type SupabaseContextType = {
  supabase: SupabaseClient
  session: Session | null
}

// Inicializar o cliente Supabase imediatamente para evitar null
const supabaseClient = createClientComponentClient()

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: supabaseClient,
  session: null,
})

interface SupabaseProviderProps {
  children: React.ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Obter sessão inicial
    const getSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession()
      setSession(session)
    }

    getSession()

    // Configurar listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("[SUPABASE] Auth state change:", event)
      setSession(session)
    })

    // Limpar subscription quando o componente for desmontado
    return () => subscription.unsubscribe()
  }, [])

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient, session }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
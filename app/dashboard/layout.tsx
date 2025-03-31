"use client"

import React from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Verificar autenticação e redirecionar se necessário
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Enquanto estiver carregando, não mostra nada
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não houver usuário, não renderiza nada (será redirecionado)
  if (!user) {
    return null
  }

  // Se o usuário estiver autenticado, renderiza o layout com o conteúdo
  return <>{children}</>
}
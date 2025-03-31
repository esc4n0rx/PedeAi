"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { CreateStoreForm } from "@/components/create-store-form"
import { useAuth } from "@/components/auth-provider"

export default function Dashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [profileData, setProfileData] = useState<{ full_name?: string; email?: string; } | undefined>(undefined)
  const [storeData, setStoreData] = useState(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [productsCount, setProductsCount] = useState(0)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    // Se não estiver carregando e não tiver usuário, redirecionar para login
    if (!isLoading && !user) {
      console.log('[DASHBOARD] Nenhum usuário autenticado, redirecionando para login');
      router.push("/login")
      return
    }

    if (user) {
      console.log('[DASHBOARD] Usuário autenticado, carregando dados do dashboard', { userId: user.id });
      
      const fetchData = async () => {
        const supabase = createClientComponentClient()
        
        try {
          // Buscar perfil do usuário usando o ID do token
          console.log('[DASHBOARD] Buscando perfil do usuário');
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (profileError) {
            console.error("[DASHBOARD] Erro ao buscar perfil:", profileError)
          } else {
            console.log('[DASHBOARD] Perfil encontrado:', profile);
            setProfileData(profile)
          }

          // Buscar loja do usuário
          console.log('[DASHBOARD] Buscando loja do usuário');
          const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle() // Usar maybeSingle em vez de single para evitar erro quando não há loja

          // Verificação do erro corrigida
          if (storeError) {
            console.error("[DASHBOARD] Erro ao buscar loja:", storeError)
          } else {
            console.log('[DASHBOARD] Loja encontrada:', store);
            setStoreData(store)
          }

          // Se tiver loja, buscar pedidos recentes
          if (store) {
            console.log('[DASHBOARD] Buscando pedidos recentes');
            const { data: orders, error: ordersError } = await supabase
              .from("orders")
              .select("*")
              .eq("store_id", store.id)
              .order("created_at", { ascending: false })
              .limit(5)

            if (ordersError) {
              console.error("[DASHBOARD] Erro ao buscar pedidos:", ordersError)
            } else {
              console.log('[DASHBOARD] Pedidos encontrados:', orders?.length || 0);
              setRecentOrders(orders || [])
            }

            // Buscar contagem de produtos
            console.log('[DASHBOARD] Contando produtos');
            const { count, error: productsError } = await supabase
              .from("products")
              .select("id", { count: "exact", head: true })
              .eq("store_id", store.id)

            if (productsError) {
              console.error("[DASHBOARD] Erro ao contar produtos:", productsError)
            } else {
              console.log('[DASHBOARD] Quantidade de produtos:', count);
              setProductsCount(count || 0)
            }
          } else {
            console.log('[DASHBOARD] Nenhuma loja encontrada para este usuário');
          }
        } catch (error) {
          console.error("[DASHBOARD] Erro ao carregar dados do dashboard:", error)
        } finally {
          setIsPageLoading(false)
        }
      }

      fetchData()
    } else if (!isLoading) {
      setIsPageLoading(false)
    }
  }, [user, isLoading, router])

  // Mostra um indicador de carregamento enquanto verifica autenticação e busca dados
  if (isLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não houver usuário autenticado, não renderiza nada (será redirecionado)
  if (!user) {
    return null
  }

  // Se o usuário tiver uma loja, mostra o dashboard completo
  if (storeData) {
    return (
      <div className="flex h-screen flex-col">
        <DashboardHeader user={profileData} />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar hasStore={!!storeData} />
          <main className="flex-1 overflow-y-auto p-6">
            <DashboardOverview 
              store={storeData} 
              productsCount={productsCount} 
              recentOrders={recentOrders} 
            />
          </main>
        </div>
      </div>
    )
  }

  // Se o usuário não tiver uma loja, mostrar o formulário de criação
  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={profileData} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar hasStore={false} />
        <main className="flex-1 overflow-y-auto p-6">
          <CreateStoreForm userId={user.id} />
        </main>
      </div>
    </div>
  )
}
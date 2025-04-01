"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { ShoppingBag, Clock, CheckCircle, XCircle, Filter } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface StoreData {
  id: string
  name: string
  user_id: string
  [key: string]: any
}

interface OrderData {
  id: string
  store_id: string
  customer_name: string
  status: string
  total: number
  created_at: string
  [key: string]: any
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  
  useEffect(() => {
    // Se não estiver carregando e não tiver usuário, redirecionar para login
    if (!isLoading && !user) {
      console.log('[ORDERS] Nenhum usuário autenticado, redirecionando para login');
      router.push("/login")
      return
    }
    
    if (user) {
      console.log('[ORDERS] Usuário autenticado, carregando dados de pedidos', { userId: user.id });
      
      const fetchData = async () => {
        const supabase = createClientComponentClient()
        
        try {
          // Buscar loja do usuário
          console.log('[ORDERS] Buscando loja do usuário');
          const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("*")
            .eq("user_id", user.id)
            .single()
            
          if (storeError) {
            console.error("[ORDERS] Erro ao buscar loja:", storeError)
            // Redirecionar para o dashboard se não encontrar loja
            router.push("/dashboard")
            return
          } else if (!store) {
            console.log('[ORDERS] Nenhuma loja encontrada, redirecionando para dashboard');
            router.push("/dashboard")
            return
          } else {
            console.log('[ORDERS] Loja encontrada:', store);
            setStoreData(store)
            
            // Buscar pedidos da loja
            console.log('[ORDERS] Buscando pedidos da loja');
            const { data: orderData, error: ordersError } = await supabase
              .from("orders")
              .select("*")
              .eq("store_id", store.id)
              .order("created_at", { ascending: false })
              
            if (ordersError) {
              console.error("[ORDERS] Erro ao buscar pedidos:", ordersError)
            } else {
              console.log('[ORDERS] Pedidos encontrados:', orderData?.length || 0);
              setOrders(orderData || [])
            }
          }
        } catch (error) {
          console.error("[ORDERS] Erro ao carregar dados de pedidos:", error)
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

  // Função para obter o ícone de status do pedido
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Função para obter o texto de status do pedido
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return "Desconhecido"
    }
  }

  // Função para filtrar pedidos
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  // Função para atualizar pedidos
  const handleRefresh = async () => {
    setIsPageLoading(true)
    const supabase = createClientComponentClient()
    
    try {
      if (storeData) {
        const { data: refreshedOrders, error } = await supabase
          .from("orders")
          .select("*")
          .eq("store_id", storeData.id)
          .order("created_at", { ascending: false })
          
        if (error) {
          console.error("[ORDERS] Erro ao atualizar pedidos:", error)
        } else {
          setOrders(refreshedOrders || [])
        }
      }
    } catch (error) {
      console.error("[ORDERS] Erro ao atualizar pedidos:", error)
    } finally {
      setIsPageLoading(false)
    }
  }

  // Filtrar pedidos de acordo com o filtro ativo
  const filteredOrders = orders.filter(order => {
    if (activeFilter === "all") return true
    return order.status === activeFilter
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-fredoka text-3xl font-bold tracking-tight">Pedidos</h2>
        <p className="text-muted-foreground">Gerencie todos os pedidos da sua loja</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleFilterChange("all")}
            className={activeFilter === "all" ? "bg-primary text-primary-foreground" : ""}
          >
            Todos
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleFilterChange("pending")}
            className={activeFilter === "pending" ? "bg-primary text-primary-foreground" : ""}
          >
            Pendentes
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleFilterChange("completed")}
            className={activeFilter === "completed" ? "bg-primary text-primary-foreground" : ""}
          >
            Concluídos
          </Button>
        </div>
        <Button onClick={handleRefresh}>Atualizar</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todos os Pedidos</CardTitle>
          <CardDescription>{filteredOrders.length} pedidos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{formatDateTime(order.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum pedido encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Seus pedidos aparecerão aqui quando você começar a recebê-los.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
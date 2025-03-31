import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { ShoppingBag, Clock, CheckCircle, XCircle, Filter } from "lucide-react"

export default async function OrdersPage() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    // Buscar loja do usuário
    const { data: storeData } = await supabase.from("stores").select("*").eq("user_id", session.user.id).single()

    if (!storeData) {
      redirect("/dashboard")
    }

    // Buscar pedidos
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("store_id", storeData.id)
      .order("created_at", { ascending: false })

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
            <Button variant="outline" size="sm">
              Todos
            </Button>
            <Button variant="outline" size="sm">
              Pendentes
            </Button>
            <Button variant="outline" size="sm">
              Concluídos
            </Button>
          </div>

          <Button>Atualizar</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos os Pedidos</CardTitle>
            <CardDescription>{orders?.length || 0} pedidos encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
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
                  {orders.map((order) => (
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
  } catch (error) {
    console.error("Orders page error:", error)
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Erro ao carregar pedidos</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível carregar os pedidos. Por favor, tente novamente mais tarde.
        </p>
        <Button asChild>
          <a href="/dashboard">Voltar para o Dashboard</a>
        </Button>
      </div>
    )
  }
}


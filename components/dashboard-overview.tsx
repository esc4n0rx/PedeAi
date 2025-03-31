"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"

interface Order {
  id: string
  customer_name: string
  total: number
  status: "pending" | "completed" | "cancelled"
  created_at: string
}

interface Store {
  id: string
  name: string
  logo_url?: string
  created_at: string
}

interface DashboardOverviewProps {
  store: Store
  productsCount: number
  recentOrders: Order[]
}

export function DashboardOverview({ store, productsCount, recentOrders = [] }: DashboardOverviewProps) {
  // Calcular estatísticas de pedidos
  const totalOrders = recentOrders.length
  const completedOrders = recentOrders.filter((order) => order.status === "completed").length
  const pendingOrders = recentOrders.filter((order) => order.status === "pending").length

  // Calcular receita total
  const totalRevenue = recentOrders
    .filter((order) => order.status === "completed")
    .reduce((acc, order) => acc + order.total, 0)

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
        <h2 className="font-fredoka text-3xl font-bold tracking-tight">Bem-vindo, {store.name}</h2>
        <p className="text-muted-foreground">Aqui está um resumo do seu negócio hoje</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            Análises
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">{pendingOrders} pendentes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productsCount}</div>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">+7 no último mês</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-muted-foreground">-2% em relação à semana passada</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>Você recebeu {totalOrders} pedidos recentemente</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-8">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className="text-sm font-medium">{getStatusText(order.status)}</span>
                          </div>
                          <div className="font-medium">{formatCurrency(order.total)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum pedido recente</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Seus pedidos recentes aparecerão aqui quando você começar a recebê-los.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Gerencie seu negócio com facilidade</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild>
                    <Link href="/dashboard/produtos/novo">Adicionar Produto</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/pedidos">Ver Pedidos</Link>
                  </Button>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Gerencie seu catálogo</h4>
                      <p className="text-sm text-muted-foreground">Adicione, edite e organize seus produtos.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Conheça seus clientes</h4>
                      <p className="text-sm text-muted-foreground">Veja quem são seus clientes mais fiéis.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


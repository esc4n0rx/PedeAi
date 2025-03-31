"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Package, Settings, CreditCard, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface DashboardSidebarProps {
  hasStore: boolean
}

export function DashboardSidebar({ hasStore }: DashboardSidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Visão Geral",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      disabled: !hasStore,
    },
    {
      href: "/dashboard/pedidos",
      label: "Pedidos",
      icon: ShoppingBag,
      active: pathname === "/dashboard/pedidos",
      disabled: !hasStore,
    },
    {
      href: "/dashboard/produtos",
      label: "Produtos",
      icon: Package,
      active: pathname === "/dashboard/produtos",
      disabled: !hasStore,
    },
    {
      href: "/dashboard/loja",
      label: "Minha Loja",
      icon: Store,
      active: pathname === "/dashboard/loja",
      disabled: !hasStore,
    },
    {
      href: "/dashboard/assinatura",
      label: "Assinatura",
      icon: CreditCard,
      active: pathname === "/dashboard/assinatura",
    },
    {
      href: "/dashboard/configuracoes",
      label: "Configurações",
      icon: Settings,
      active: pathname === "/dashboard/configuracoes",
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex flex-col space-y-6 p-4">
        <div className="flex flex-col space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "secondary" : "ghost"}
              className={cn("justify-start", route.disabled && "opacity-50 pointer-events-none")}
              asChild={!route.disabled}
            >
              {!route.disabled ? (
                <Link href={route.href}>
                  <route.icon className="mr-2 h-5 w-5" />
                  {route.label}
                </Link>
              ) : (
                <div>
                  <route.icon className="mr-2 h-5 w-5" />
                  {route.label}
                </div>
              )}
            </Button>
          ))}
        </div>

        <Separator />

        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-sm font-medium">Plano Atual: Gratuito</h4>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Atualize para o plano Premium para desbloquear todos os recursos e aumentar suas vendas.
          </p>
          <Button size="sm" className="w-full" asChild>
            <Link href="/dashboard/assinatura">Fazer Upgrade</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


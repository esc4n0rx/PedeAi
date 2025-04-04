"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, CreditCard, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

type PlanType = 'free' | 'premium' | 'business';

interface UserData {
  id: string;
  plan: PlanType;
}

interface PlanItem {
  name: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
  cta: string;
  disabled: boolean;
  popular?: boolean;
  value: PlanType;
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  useEffect(() => {
    // Se não estiver carregando e não tiver usuário, redirecionar para login
    if (!isLoading && !user) {
      console.log('[SUBSCRIPTION] Nenhum usuário autenticado, redirecionando para login');
      router.push("/login")
      return
    }
    
    if (user) {
      console.log('[SUBSCRIPTION] Usuário autenticado, carregando dados de assinatura', { userId: user.id });
      
      const fetchData = async () => {
        const supabase = createClientComponentClient()
        
        try {
          // Buscar dados do usuário
          console.log('[SUBSCRIPTION] Buscando perfil do usuário');
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
            
          if (profileError) {
            console.error("[SUBSCRIPTION] Erro ao buscar perfil:", profileError)
          } else {
            console.log('[SUBSCRIPTION] Perfil encontrado:', profile);
            setUserData(profile)
          }
        } catch (error) {
          console.error("[SUBSCRIPTION] Erro ao carregar dados da assinatura:", error)
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

  const currentPlan = (userData?.plan || "free") as PlanType;
  
  const plans: PlanItem[] = [
    {
      name: "Gratuito",
      description: "Para pequenos negócios começando agora.",
      price: "R$ 0",
      duration: "/mês",
      features: [
        "Até 50 produtos",
        "Até 100 pedidos/mês",
        "Página da loja personalizada",
        "Processamento de pagamentos (taxa de 3%)",
        "Suporte por email",
      ],
      cta: "Plano Atual",
      disabled: currentPlan === "free",
      value: "free",
    },
    {
      name: "Premium",
      description: "Para negócios em crescimento.",
      price: "R$ 99",
      duration: "/mês",
      features: [
        "Produtos ilimitados",
        "Pedidos ilimitados",
        "Página da loja personalizada",
        "Processamento de pagamentos (taxa de 1.5%)",
        "Relatórios avançados",
        "Integração com delivery",
        "Suporte prioritário 24/7",
        "Sem marca d'água",
      ],
      cta: currentPlan === "premium" ? "Plano Atual" : "Fazer Upgrade",
      disabled: currentPlan === "premium",
      popular: true,
      value: "premium",
    },
    {
      name: "Empresarial",
      description: "Para negócios estabelecidos.",
      price: "R$ 199",
      duration: "/mês",
      features: [
        "Tudo do Premium",
        "API personalizada",
        "Múltiplas lojas",
        "Processamento de pagamentos (taxa de 1%)",
        "Gerenciamento de equipe",
        "Treinamento personalizado",
        "Gerente de conta dedicado",
        "SLA garantido",
      ],
      cta: currentPlan === "business" ? "Plano Atual" : "Fazer Upgrade",
      disabled: currentPlan === "business",
      value: "business",
    },
  ];

  const handleUpgrade = (plan: PlanType): void => {
    // Implementar lógica de upgrade
    console.log(`Upgrade para o plano ${plan}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-fredoka text-3xl font-bold tracking-tight">Assinatura</h2>
        <p className="text-muted-foreground">Gerencie seu plano e método de pagamento</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn("flex flex-col", plan.popular && "border-primary shadow-md")}>
            {plan.popular && (
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Mais Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4 flex items-baseline">
                <span className="font-fredoka text-3xl font-bold">{plan.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">{plan.duration}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2.5">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"} 
                disabled={plan.disabled}
                onClick={() => !plan.disabled && handleUpgrade(plan.value)}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Método de Pagamento</CardTitle>
          <CardDescription>Gerencie seus métodos de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan === "free" ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Nenhum método de pagamento</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Você está no plano gratuito. Adicione um método de pagamento quando estiver pronto para fazer upgrade.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Cartão de Crédito</h4>
                    <p className="text-sm text-muted-foreground">**** **** **** 4242</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </div>
              <div className="flex items-center gap-2 p-4 border rounded-lg bg-yellow-50 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Seu cartão expira em 30 dias. Atualize suas informações de pagamento.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
          <CardDescription>Visualize e baixe suas faturas anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan === "free" ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <h3 className="text-lg font-semibold">Nenhuma fatura</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Você está no plano gratuito. Suas faturas aparecerão aqui quando você fizer upgrade.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h4 className="font-medium">Fatura #1234</h4>
                  <p className="text-sm text-muted-foreground">01/03/2024</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">R$ 99,00</span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h4 className="font-medium">Fatura #1233</h4>
                  <p className="text-sm text-muted-foreground">01/02/2024</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">R$ 99,00</span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
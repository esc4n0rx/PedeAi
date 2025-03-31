"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LandingPricing() {
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: "Gratuito",
      description: "Para pequenos negócios começando agora.",
      price: annual ? "R$ 0" : "R$ 0",
      duration: "/mês",
      features: [
        "Até 50 produtos",
        "Até 100 pedidos/mês",
        "Página da loja personalizada",
        "Processamento de pagamentos (taxa de 3%)",
        "Suporte por email",
      ],
      cta: "Começar Grátis",
      href: "/registro",
      popular: false,
    },
    {
      name: "Premium",
      description: "Para negócios em crescimento.",
      price: annual ? "R$ 89" : "R$ 99",
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
      cta: "Começar Agora",
      href: "/registro?plan=premium",
      popular: true,
    },
    {
      name: "Empresarial",
      description: "Para negócios estabelecidos.",
      price: annual ? "R$ 179" : "R$ 199",
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
      cta: "Fale Conosco",
      href: "/contato",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">Preços simples e transparentes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano que melhor se adapta ao seu negócio. Sem taxas ocultas, sem surpresas.
          </p>

          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
              <Button
                variant={annual ? "ghost" : "default"}
                size="sm"
                onClick={() => setAnnual(false)}
                className="relative"
              >
                Mensal
              </Button>
              <Button
                variant={annual ? "default" : "ghost"}
                size="sm"
                onClick={() => setAnnual(true)}
                className="relative"
              >
                Anual
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                  -10%
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-lg border bg-card p-6 shadow-sm",
                plan.popular && "border-primary shadow-md",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Mais Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-fredoka text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="font-fredoka text-3xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">{plan.duration}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="mt-8 w-full" variant={plan.popular ? "default" : "outline"} asChild>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


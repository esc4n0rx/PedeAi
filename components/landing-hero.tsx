"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight } from "lucide-react"

export function LandingHero() {
  const [mounted, setMounted] = useState(false)

  // Usar useState para evitar erros de hidratação
  useState(() => {
    setMounted(true)
  })

  // Renderização estática para SSR
  if (!mounted) {
    return (
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="font-fredoka text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Venda online sem taxas abusivas
              </h1>
              <p className="text-xl text-muted-foreground">
                Transforme seu pequeno negócio com uma plataforma completa para receber pedidos, gerenciar entregas e
                aumentar suas vendas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Button size="lg" asChild>
                  <Link href="/registro">Começar Gratuitamente</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/#features">Conhecer Recursos</Link>
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4" />
                <span>Mais de 500 pequenos negócios já usam o PedeAí</span>
              </div>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="Dashboard do PedeAí"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-fredoka text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Venda online sem taxas abusivas
            </h1>
            <p className="text-xl text-muted-foreground">
              Transforme seu pequeno negócio com uma plataforma completa para receber pedidos, gerenciar entregas e
              aumentar suas vendas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button size="lg" asChild>
                <Link href="/registro">Começar Gratuitamente</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#features">
                  Conhecer Recursos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <motion.div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Mais de 500 pequenos negócios já usam o PedeAí</span>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/placeholder.svg?height=500&width=500"
              alt="Dashboard do PedeAí"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}


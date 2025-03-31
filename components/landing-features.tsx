"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ShoppingBag, BarChart, CreditCard, Smartphone, Clock, Users } from "lucide-react"

const features = [
  {
    icon: ShoppingBag,
    title: "Catálogo Digital",
    description: "Crie um catálogo digital completo com fotos, descrições e preços dos seus produtos.",
  },
  {
    icon: BarChart,
    title: "Relatórios Detalhados",
    description: "Acompanhe o desempenho do seu negócio com relatórios e estatísticas em tempo real.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos Online",
    description: "Aceite pagamentos online com cartão de crédito, débito, PIX e outros métodos.",
  },
  {
    icon: Smartphone,
    title: "Aplicativo Personalizado",
    description: "Tenha seu próprio aplicativo personalizado com a sua marca para seus clientes.",
  },
  {
    icon: Clock,
    title: "Gestão de Pedidos",
    description: "Gerencie todos os pedidos em um só lugar, com notificações em tempo real.",
  },
  {
    icon: Users,
    title: "Fidelização de Clientes",
    description: "Crie programas de fidelidade e promoções para seus clientes mais fiéis.",
  },
]

export function LandingFeatures() {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  // Renderização estática para SSR
  if (!mounted) {
    return (
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para pequenos negócios gerenciarem suas vendas online
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-card rounded-lg border p-6 shadow-sm">
                  <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-fredoka text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-20 relative rounded-lg overflow-hidden shadow-xl">
            <div className="aspect-video relative">
              <Image
                src="/placeholder.svg?height=720&width=1280"
                alt="Dashboard do PedeAí"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa para vender online</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa para pequenos negócios gerenciarem suas vendas online
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-card rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-fredoka text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          className="mt-20 relative rounded-lg overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 40 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="aspect-video relative">
            <Image
              src="/placeholder.svg?height=720&width=1280"
              alt="Dashboard do PedeAí"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}


"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    name: "Ana Silva",
    role: "Proprietária, Café Aroma",
    content:
      "O PedeAí transformou meu pequeno café. Antes, eu gastava 30% com taxas em outros apps. Agora, tenho meu próprio sistema de pedidos e economizo muito!",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5,
  },
  {
    name: "Carlos Oliveira",
    role: "Gerente, Pizzaria Napoli",
    content:
      "Implementamos o PedeAí há 3 meses e nossas vendas online aumentaram 40%. A plataforma é intuitiva e o suporte é excelente.",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5,
  },
  {
    name: "Mariana Costa",
    role: "Proprietária, Doceria Doce Sabor",
    content:
      "Como pequena empreendedora, o PedeAí foi perfeito para mim. Consigo gerenciar meus pedidos facilmente e os clientes adoram a experiência.",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4,
  },
  {
    name: "Roberto Almeida",
    role: "Dono, Hamburgueria Artesanal",
    content:
      "Depois de usar vários aplicativos de delivery, o PedeAí é de longe o melhor para pequenos negócios. As taxas são justas e a plataforma é completa.",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5,
  },
  {
    name: "Juliana Santos",
    role: "Gerente, Restaurante Sabor Caseiro",
    content:
      "O dashboard de análises me ajuda a entender melhor meu negócio. Consigo ver quais pratos vendem mais e em quais horários. Isso é ouro para nós!",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5,
  },
  {
    name: "Fernando Gomes",
    role: "Proprietário, Padaria Pão Dourado",
    content:
      "Minha padaria agora recebe pedidos online sem complicação. O sistema é simples de usar e meus clientes mais idosos conseguem fazer pedidos sem dificuldade.",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4,
  },
]

export function LandingTestimonials() {
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
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">O que nossos clientes dizem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Centenas de pequenos negócios já estão crescendo com o PedeAí
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground",
                      )}
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">O que nossos clientes dizem</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Centenas de pequenos negócios já estão crescendo com o PedeAí
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground",
                    )}
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground">"{testimonial.content}"</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}


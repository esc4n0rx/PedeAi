import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingCTA() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4">Pronto para transformar seu negócio?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de pequenos negócios que já estão crescendo com o PedeAí. Comece gratuitamente hoje
            mesmo e veja a diferença.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/registro">Começar Gratuitamente</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contato">Falar com Vendas</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Não é necessário cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  )
}


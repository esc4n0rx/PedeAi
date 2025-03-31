import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image } from "lucide-react"

export default async function StoreSettingsPage() {
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

    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="font-fredoka text-3xl font-bold tracking-tight">Minha Loja</h2>
          <p className="text-muted-foreground">Gerencie as informações e configurações da sua loja</p>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="delivery">Entrega</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Loja</CardTitle>
                <CardDescription>Estas informações serão exibidas para seus clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Nome da Loja</h3>
                    <p className="text-sm text-muted-foreground">{storeData.name}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Telefone</h3>
                    <p className="text-sm text-muted-foreground">{storeData.phone}</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <h3 className="text-sm font-medium">Descrição</h3>
                    <p className="text-sm text-muted-foreground">{storeData.description}</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <h3 className="text-sm font-medium">Endereço</h3>
                    <p className="text-sm text-muted-foreground">{storeData.address}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Editar Informações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Aparência da Loja</CardTitle>
                <CardDescription>Personalize a aparência da sua loja online</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Logo da Loja</h3>
                    <div className="flex items-center justify-center h-40 w-40 rounded-lg border border-dashed bg-muted">
                      {storeData.logo_url ? (
                        <img
                          src={storeData.logo_url || "/placeholder.svg"}
                          alt={`Logo de ${storeData.name}`}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Image className="h-10 w-10 mb-2" />
                          <span className="text-xs">Nenhuma logo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Imagem de Capa</h3>
                    <div className="flex items-center justify-center h-40 w-full rounded-lg border border-dashed bg-muted">
                      {storeData.cover_url ? (
                        <img
                          src={storeData.cover_url || "/placeholder.svg"}
                          alt={`Capa de ${storeData.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Image className="h-10 w-10 mb-2" />
                          <span className="text-xs">Nenhuma imagem de capa</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Editar Aparência</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Horários de Funcionamento</CardTitle>
                <CardDescription>Defina os horários em que sua loja está aberta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Segunda-feira",
                    "Terça-feira",
                    "Quarta-feira",
                    "Quinta-feira",
                    "Sexta-feira",
                    "Sábado",
                    "Domingo",
                  ].map((day) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b">
                      <span className="font-medium">{day}</span>
                      <span className="text-sm">09:00 - 18:00</span>
                    </div>
                  ))}

                  <div className="flex justify-end mt-6">
                    <Button>Editar Horários</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Entrega</CardTitle>
                <CardDescription>Configure as opções de entrega para seus clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <h3 className="font-medium">Entrega própria</h3>
                      <p className="text-sm text-muted-foreground">Você faz suas próprias entregas</p>
                    </div>
                    <span className="text-sm font-medium text-green-500">Ativado</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <h3 className="font-medium">Retirada na loja</h3>
                      <p className="text-sm text-muted-foreground">Cliente retira o pedido na loja</p>
                    </div>
                    <span className="text-sm font-medium text-green-500">Ativado</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <h3 className="font-medium">Taxa de entrega</h3>
                      <p className="text-sm text-muted-foreground">Taxa cobrada pela entrega</p>
                    </div>
                    <span className="text-sm">R$ 5,00</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <h3 className="font-medium">Raio de entrega</h3>
                      <p className="text-sm text-muted-foreground">Distância máxima para entrega</p>
                    </div>
                    <span className="text-sm">5 km</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Editar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Store settings page error:", error)
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Erro ao carregar informações da loja</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível carregar as informações da sua loja. Por favor, tente novamente mais tarde.
        </p>
        <Button asChild>
          <a href="/dashboard">Voltar para o Dashboard</a>
        </Button>
      </div>
    )
  }
}


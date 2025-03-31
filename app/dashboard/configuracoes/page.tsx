import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Shield, Trash } from "lucide-react"

export default async function SettingsPage() {
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

    // Buscar dados do usuário
    const { data: userData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="font-fredoka text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Gerencie suas preferências e configurações de conta</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="danger">Zona de Perigo</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Nome Completo</h3>
                    <p className="text-sm text-muted-foreground">{userData?.full_name || "Não informado"}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">{userData?.email || session.user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">CPF/CNPJ</h3>
                    <p className="text-sm text-muted-foreground">{userData?.cpf_cnpj || "Não informado"}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Telefone</h3>
                    <p className="text-sm text-muted-foreground">{userData?.phone || "Não informado"}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Editar Perfil</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure como deseja receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Novos Pedidos</h3>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações quando novos pedidos forem feitos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="new-orders" className="mr-2" defaultChecked />
                      <label htmlFor="new-orders" className="text-sm">
                        Ativar
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Atualizações de Pedidos</h3>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações quando pedidos forem atualizados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="order-updates" className="mr-2" defaultChecked />
                      <label htmlFor="order-updates" className="text-sm">
                        Ativar
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Notificações por Email</h3>
                        <p className="text-sm text-muted-foreground">Receba um resumo diário por email</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="email-notifications" className="mr-2" />
                      <label htmlFor="email-notifications" className="text-sm">
                        Ativar
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Notificações de Marketing</h3>
                        <p className="text-sm text-muted-foreground">
                          Receba atualizações sobre novos recursos e promoções
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="marketing-notifications" className="mr-2" />
                      <label htmlFor="marketing-notifications" className="text-sm">
                        Ativar
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Salvar Preferências</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Gerencie suas configurações de segurança</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-4">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Alterar Senha</h3>
                        <p className="text-sm text-muted-foreground">Atualize sua senha de acesso</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Alterar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-4">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Autenticação de Dois Fatores</h3>
                        <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-4">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Sessões Ativas</h3>
                        <p className="text-sm text-muted-foreground">Gerencie dispositivos conectados à sua conta</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Visualizar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>Ações irreversíveis para sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-destructive/20">
                    <div className="flex items-center gap-4">
                      <Trash className="h-5 w-5 text-destructive" />
                      <div>
                        <h3 className="font-medium text-destructive">Excluir Loja</h3>
                        <p className="text-sm text-muted-foreground">
                          Exclui permanentemente sua loja e todos os dados associados
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm">
                      Excluir Loja
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-destructive/20">
                    <div className="flex items-center gap-4">
                      <Trash className="h-5 w-5 text-destructive" />
                      <div>
                        <h3 className="font-medium text-destructive">Excluir Conta</h3>
                        <p className="text-sm text-muted-foreground">
                          Exclui permanentemente sua conta e todos os dados associados
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm">
                      Excluir Conta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Settings page error:", error)
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Erro ao carregar configurações</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível carregar suas configurações. Por favor, tente novamente mais tarde.
        </p>
        <Button asChild>
          <a href="/dashboard">Voltar para o Dashboard</a>
        </Button>
      </div>
    )
  }
}


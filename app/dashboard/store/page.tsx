"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface StoreData {
  id: string
  user_id: string
  name: string
  description?: string
  address?: string
  phone?: string
  logo_url?: string
  cover_url?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export default function StoreSettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  useEffect(() => {
    // Se não estiver carregando e não tiver usuário, redirecionar para login
    if (!isLoading && !user) {
      console.log('[STORE_SETTINGS] Nenhum usuário autenticado, redirecionando para login');
      router.push("/login")
      return
    }
    
    if (user) {
      console.log('[STORE_SETTINGS] Usuário autenticado, carregando dados da loja', { userId: user.id });
      
      const fetchData = async () => {
        const supabase = createClientComponentClient()
        
        try {
          // Buscar loja do usuário
          console.log('[STORE_SETTINGS] Buscando loja do usuário');
          const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("*")
            .eq("user_id", user.id)
            .single()
            
          if (storeError) {
            console.error("[STORE_SETTINGS] Erro ao buscar loja:", storeError)
            // Redirecionar para o dashboard se não encontrar loja
            router.push("/dashboard")
            return
          } else if (!store) {
            console.log('[STORE_SETTINGS] Nenhuma loja encontrada, redirecionando para dashboard');
            router.push("/dashboard")
            return
          } else {
            console.log('[STORE_SETTINGS] Loja encontrada:', store);
            setStoreData(store)
          }
        } catch (error) {
          console.error("[STORE_SETTINGS] Erro ao carregar dados da loja:", error)
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
  if (!user || !storeData) {
    return null
  }

  // Handlers para os eventos de edição
  const handleEditInfo = () => {
    console.log('[STORE_SETTINGS] Editando informações da loja');
    // Implementar lógica para editar informações da loja
  }

  const handleEditAppearance = () => {
    console.log('[STORE_SETTINGS] Editando aparência da loja');
    // Implementar lógica para editar aparência da loja
  }

  const handleEditHours = () => {
    console.log('[STORE_SETTINGS] Editando horários de funcionamento');
    // Implementar lógica para editar horários
  }

  const handleEditDelivery = () => {
    console.log('[STORE_SETTINGS] Editando configurações de entrega');
    // Implementar lógica para editar configurações de entrega
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
                  <p className="text-sm text-muted-foreground">{storeData.phone || "Não informado"}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <h3 className="text-sm font-medium">Descrição</h3>
                  <p className="text-sm text-muted-foreground">{storeData.description || "Sem descrição"}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <h3 className="text-sm font-medium">Endereço</h3>
                  <p className="text-sm text-muted-foreground">{storeData.address || "Não informado"}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleEditInfo}>Editar Informações</Button>
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
                        src={storeData.logo_url}
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
                        src={storeData.cover_url}
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
                <Button onClick={handleEditAppearance}>Editar Aparência</Button>
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
                  <Button onClick={handleEditHours}>Editar Horários</Button>
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
                <Button onClick={handleEditDelivery}>Editar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
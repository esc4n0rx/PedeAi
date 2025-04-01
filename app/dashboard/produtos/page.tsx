"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Package, Plus, PenLine, Trash } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import ProductEditModal from "@/components/product-edit-modal"
// Importe o componente com um novo nome
import NewProductAddModal from "@/components/new-product-add-modal"

interface StoreData {
  id: string
  name: string
  user_id: string
  [key: string]: any
}

interface ProductData {
  id: string
  store_id: string
  name: string
  price: number
  category?: string
  stock?: number
  [key: string]: any
}

export default function ProductsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [products, setProducts] = useState<ProductData[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Estado para os modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  
  useEffect(() => {
    // Se não estiver carregando e não tiver usuário, redirecionar para login
    if (!isLoading && !user) {
      console.log('[PRODUCTS] Nenhum usuário autenticado, redirecionando para login');
      router.push("/login")
      return
    }
    
    if (user) {
      console.log('[PRODUCTS] Usuário autenticado, carregando dados de produtos', { userId: user.id });
      
      const fetchData = async () => {
        const supabase = createClientComponentClient()
        
        try {
          // Buscar loja do usuário
          console.log('[PRODUCTS] Buscando loja do usuário');
          const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("*")
            .eq("user_id", user.id)
            .single()
            
          if (storeError) {
            console.error("[PRODUCTS] Erro ao buscar loja:", storeError)
            // Redirecionar para o dashboard se não encontrar loja
            router.push("/dashboard")
            return
          } else if (!store) {
            console.log('[PRODUCTS] Nenhuma loja encontrada, redirecionando para dashboard');
            router.push("/dashboard")
            return
          } else {
            console.log('[PRODUCTS] Loja encontrada:', store);
            setStoreData(store)
            
            // Buscar produtos da loja
            await fetchProducts(store.id)
          }
        } catch (error) {
          console.error("[PRODUCTS] Erro ao carregar dados de produtos:", error)
        } finally {
          setIsPageLoading(false)
        }
      }
      
      fetchData()
    } else if (!isLoading) {
      setIsPageLoading(false)
    }
  }, [user, isLoading, router])

  // Função separada para buscar produtos
  const fetchProducts = async (storeId: string) => {
    const supabase = createClientComponentClient()
    
    try {
      console.log('[PRODUCTS] Buscando produtos da loja');
      const { data: productData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("name", { ascending: true })
        
      if (productsError) {
        console.error("[PRODUCTS] Erro ao buscar produtos:", productsError)
      } else {
        console.log('[PRODUCTS] Produtos encontrados:', productData?.length || 0);
        setProducts(productData || [])
      }
    } catch (error) {
      console.error("[PRODUCTS] Erro ao buscar produtos:", error)
    }
  }

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

  // Função para excluir produto
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return
    }
    
    setIsPageLoading(true)
    const supabase = createClientComponentClient()
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        
      if (error) {
        console.error("[PRODUCTS] Erro ao excluir produto:", error)
        alert("Erro ao excluir produto. Tente novamente.")
      } else {
        console.log('[PRODUCTS] Produto excluído com sucesso');
        // Atualizar lista de produtos
        setProducts(products.filter(product => product.id !== productId))
      }
    } catch (error) {
      console.error("[PRODUCTS] Erro ao excluir produto:", error)
      alert("Erro ao excluir produto. Tente novamente.")
    } finally {
      setIsPageLoading(false)
    }
  }

  // Função para abrir o modal de edição
  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId)
    setIsEditModalOpen(true)
  }

  // Função para abrir o modal de adição
  const handleAddProduct = () => {
    setIsAddModalOpen(true)
  }

  // Função para lidar com a atualização ou adição de produto
  const handleProductChanged = async () => {
    if (storeData) {
      await fetchProducts(storeData.id)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-fredoka text-3xl font-bold tracking-tight">Produtos</h2>
            <p className="text-muted-foreground">Gerencie o catálogo de produtos da sua loja</p>
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Todos os Produtos</CardTitle>
            <CardDescription>{products.length} produtos encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category || "Sem categoria"}</TableCell>
                      <TableCell>{product.stock || "N/A"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditProduct(product.id)}
                          >
                            <PenLine className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum produto encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Adicione produtos ao seu catálogo para começar a vender.
                </p>
                <Button className="mt-4" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de edição de produtos */}
      {storeData && (
        <ProductEditModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProductId(null)
          }}
          onProductUpdated={handleProductChanged}
          productId={selectedProductId}
          storeId={storeData.id}
        />
      )}

      {/* Modal de adição de produtos - usando o novo componente */}
      {storeData && (
        <NewProductAddModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onProductAdded={handleProductChanged}
          storeId={storeData.id}
        />
      )}
    </>
  )
}
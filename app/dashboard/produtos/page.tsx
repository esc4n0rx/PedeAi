import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Package, Plus, PenLine, Trash } from "lucide-react"

export default async function ProductsPage() {
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

    // Buscar produtos
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeData.id)
      .order("name", { ascending: true })

    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-fredoka text-3xl font-bold tracking-tight">Produtos</h2>
            <p className="text-muted-foreground">Gerencie o catálogo de produtos da sua loja</p>
          </div>

          <Button asChild>
            <Link href="/dashboard/produtos/novo">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos os Produtos</CardTitle>
            <CardDescription>{products?.length || 0} produtos encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {products && products.length > 0 ? (
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
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/produtos/${product.id}`}>
                              <PenLine className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
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
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/produtos/novo">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Products page error:", error)
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Erro ao carregar produtos</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível carregar os produtos. Por favor, tente novamente mais tarde.
        </p>
        <Button asChild>
          <a href="/dashboard">Voltar para o Dashboard</a>
        </Button>
      </div>
    )
  }
}


import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Verificar se o usuário está autenticado pelo token no cookie
  const token = req.cookies.get("authToken")?.value

  // Verificar se existe token
  const isAuthenticated = !!token

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/dashboard"]

  // Rotas de autenticação que não devem ser acessadas se o usuário já estiver logado
  const authRoutes = ["/login", "/registro", "/recuperar-senha"]

  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Verificar se a rota atual é de autenticação
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname === route)

  // Redirecionar para login se tentar acessar rota protegida sem estar autenticado
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirecionar para dashboard se tentar acessar rota de autenticação já estando logado
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
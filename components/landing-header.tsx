"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function LandingHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const routes = [
    {
      href: "/#features",
      label: "Recursos",
    },
    {
      href: "/#pricing",
      label: "Preços",
    },
    {
      href: "/#testimonials",
      label: "Depoimentos",
    },
    {
      href: "/blog",
      label: "Blog",
    },
  ]
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image 
              src="/mascote.png" 
              alt="PedeAí Mascote" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-fredoka text-xl font-bold">PedeAí</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/registro">Registrar</Link>
            </Button>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-6">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === route.href ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="ghost" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/registro" onClick={() => setIsOpen(false)}>
                      Registrar
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
'use client';
import type { ReactNode } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Rocket, Building, ChevronDown, LayoutDashboard, List, PiggyBank, Target, Settings, Repeat } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel" },
  { href: "/dashboard/transactions", icon: List, label: "Transacciones" },
  { href: "/dashboard/debts", icon: PiggyBank, label: "Deudas y Suscripciones" },
  { href: "/dashboard/fixed-expenses", icon: Repeat, label: "Gastos Fijos" },
  { href: "/dashboard/goals", icon: Target, label: "Metas de Ahorro" },
];

export function Header() {
  const pathname = usePathname();
  const pageTitle = navItems.find(item => pathname === item.href)?.label || 
                  navItems.find(item => item.href !== "/dashboard" && pathname.startsWith(item.href))?.label || 
                  "Panel";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      
      
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar menú de navegación</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-card/80">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Navegación Principal</SheetTitle>
                </SheetHeader>
              <MobileSidebar />
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold hidden sm:block">{pathname.startsWith('/dashboard/settings') ? 'Configuración' : pageTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
           <UserMenu />
        </div>
      </div>
    </header>
  );
}

function MobileSidebar() {
    const pathname = usePathname();
    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-8">
                <Rocket className="h-7 w-7" />
                <h1 className="font-headline">FA Vision</h1>
            </div>
            <nav className="grid gap-2 text-lg font-medium">
                {navItems.map((item) => (
                    <Link
                        href={item.href}
                        key={item.label}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) ? "bg-muted text-primary" : "text-muted-foreground"}`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2">
               <Link href="/dashboard/settings" className={`flex items-center gap-4 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname.startsWith("/dashboard/settings") ? "bg-muted text-primary" : "text-muted-foreground"}`}>
                    <Settings className="h-5 w-5" />
                    Configuración
                </Link>
            </div>
        </div>
    )
}

function UserMenu() {
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                 <AvatarImage data-ai-hint="profile picture" src="https://picsum.photos/100" alt="Usuario" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
               <p className="truncate text-sm font-semibold">Nombre de Usuario</p>
               <p className="text-xs text-muted-foreground">usuario@favision.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Facturación</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Configuración</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    );
}

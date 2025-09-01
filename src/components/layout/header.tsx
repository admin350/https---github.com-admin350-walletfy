'use client';
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Rocket, Building, ChevronDown, LayoutDashboard, List, PiggyBank, Target, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel" },
  { href: "/dashboard/transactions", icon: List, label: "Transacciones" },
  { href: "/dashboard/debts", icon: PiggyBank, label: "Deudas y Suscripciones" },
  { href: "/dashboard/goals", icon: Target, label: "Metas de Ahorro" },
];

export function Header() {
  const pathname = usePathname();
  const pageTitle = navItems.find(item => pathname.startsWith(item.href))?.label || "Configuración";
  if (pathname === '/dashboard') {
    return null; // No header on the main dashboard page for a cleaner look
  }


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Alternar menú de navegación</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-4 bg-card/80">
          <MobileSidebar />
        </SheetContent>
      </Sheet>
      
      <h1 className="text-xl font-semibold">{pathname.startsWith('/dashboard/settings') ? 'Configuración' : pageTitle}</h1>
    </header>
  );
}

function MobileSidebar() {
    const pathname = usePathname();
    return (
        <>
            <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-8">
                <Rocket className="h-7 w-7" />
                <h1 className="font-headline">FA Vision</h1>
            </div>
            <div className="mb-4">
                <WorkspaceSwitcher />
            </div>
            <nav className="grid gap-2 text-lg font-medium">
                {navItems.map((item) => (
                    <Link
                        href={item.href}
                        key={item.label}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname.startsWith(item.href) ? "bg-muted text-primary" : "text-muted-foreground"}`}
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
                <UserMenu />
            </div>
        </>
    )
}

function WorkspaceSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Building className="mr-2 h-4 w-4" />
            <span className="truncate">Finanzas Personales</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[calc(100vw-3rem)] sm:w-60">
        <DropdownMenuLabel>Espacios de Trabajo</DropdownMenuLabel>
        <DropdownMenuItem>
          <Building className="mr-2 h-4 w-4" />
          Finanzas Personales
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Building className="mr-2 h-4 w-4" />
          Familia
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Building className="mr-2 h-4 w-4" />
          FA Brokers
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Crear Espacio de Trabajo</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto w-full justify-start gap-3 p-2 text-left">
              <Avatar className="h-9 w-9">
                 <AvatarImage data-ai-hint="profile picture" src="https://picsum.photos/100" alt="Usuario" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                 <p className="truncate text-sm font-semibold">Nombre de Usuario</p>
                 <p className="text-xs text-muted-foreground">usuario@favision.com</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    );
}

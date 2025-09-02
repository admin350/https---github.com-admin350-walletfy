

'use client';
import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Rocket, Settings, LayoutDashboard, List, CreditCard, Repeat, Landmark, Target, TrendingUp, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { HoverMenu } from './hover-menu';
import { DataContext } from "@/context/data-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format, getYear } from "date-fns";
import { es } from "date-fns/locale";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel", color: "text-sky-400" },
  { href: "/dashboard/transactions", icon: List, label: "Transacciones", color: "text-orange-400" },
  { href: "/dashboard/debts", icon: CreditCard, label: "Deudas", color: "text-red-400" },
  { href: "/dashboard/subscriptions", icon: Repeat, label: "Suscripciones", color: "text-purple-400" },
  { href: "/dashboard/fixed-expenses", icon: Repeat, label: "Gastos Fijos", color: "text-indigo-400" },
  { href: "/dashboard/savings-portfolio", icon: Landmark, label: "Cartera de Ahorros", color: "text-emerald-400" },
  { href: "/dashboard/goals", icon: Target, label: "Metas", color: "text-yellow-400" },
  { href: "/dashboard/investments", icon: TrendingUp, label: "Inversiones", color: "text-green-400" },
  { href: "/dashboard/investments-portfolio", icon: Wallet, label: "Cartera de Inversión", color: "text-blue-400" },
];

export function Header() {
  const pathname = usePathname();
  const pageTitle = navItems.find(item => pathname === item.href)?.label || 
                  navItems.find(item => item.href !== "/dashboard" && pathname.startsWith(item.href))?.label || 
                  "Panel";
                  
  const [isClient, setIsClient] = useState(false);
  const { 
    profiles, 
    filters,
    setFilters,
    availableYears 
  } = useContext(DataContext);
  
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2000, i), 'LLLL', { locale: es }),
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
            {isClient ? <HoverMenu navItems={navItems} /> : (
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
                        <MobileSidebar navItems={navItems} />
                    </SheetContent>
                </Sheet>
            )}
          <h1 className="text-xl font-semibold hidden sm:block">{pathname.startsWith('/dashboard/settings') ? 'Configuración' : pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            {isClient && (
                 <div className="flex items-center gap-2">
                     <Select
                        value={filters.profile}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, profile: value }))}
                    >
                        <SelectTrigger className="w-[130px] hidden md:flex">
                            <SelectValue placeholder="Perfil" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Perfiles</SelectItem>
                             {profiles.map(p => (
                                <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select
                        value={filters.month.toString()}
                        onValueChange={(value) => setFilters(prev => ({...prev, month: parseInt(value)}))}
                    >
                        <SelectTrigger className="w-[130px] hidden md:flex">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-1">Todo el Año</SelectItem>
                            {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label.charAt(0).toUpperCase() + m.label.slice(1)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select
                         value={filters.year.toString()}
                         onValueChange={(value) => setFilters(prev => ({...prev, year: parseInt(value)}))}
                    >
                        <SelectTrigger className="w-[100px] hidden md:flex">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                           {availableYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
            )}
           <Button variant="ghost" className="hidden sm:inline-flex">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
           </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </header>
  );
}

export function MobileSidebar({ navItems }: { navItems: any[] }) {
    const pathname = usePathname();

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-8">
                <Rocket className="h-7 w-7" />
                <h1 className="font-headline">FA Vision</h1>
            </div>

            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-2">Navegación</h3>
            <nav className="grid gap-2 text-lg font-medium">
                {navItems.map((item) => (
                    <Link
                        href={item.href}
                        key={item.label}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) ? "bg-muted text-primary" : "text-muted-foreground"}`}
                    >
                        <item.icon className={`h-5 w-5 ${item.color}`} />
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

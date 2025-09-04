'use client';
import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Wallet, Settings, LayoutDashboard, List, CreditCard, Repeat, Landmark, Target, TrendingUp, ClipboardPen, Banknote, Building, FileText, Calendar, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { HoverMenu } from './hover-menu';
import { DataContext } from "@/context/data-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format, getYear } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/context/auth-context";

const navSections = [
    {
        title: "Análisis y Registros",
        items: [
            { href: "/dashboard/dashboard", icon: LayoutDashboard, label: "Panel", color: "text-sky-400" },
            { href: "/dashboard/transactions", icon: List, label: "Transacciones", color: "text-orange-400" },
            { href: "/dashboard/budget", icon: ClipboardPen, label: "Presupuesto", color: "text-rose-400" },
            { href: "/dashboard/calendar", icon: Calendar, label: "Calendario", color: "text-amber-400" },
            { href: "/dashboard/fixed-expenses", icon: Repeat, label: "Gastos Fijos", color: "text-indigo-400" },
            { href: "/dashboard/debts", icon: CreditCard, label: "Deudas", color: "text-red-400" },
            { href: "/dashboard/subscriptions", icon: Repeat, label: "Suscripciones", color: "text-purple-400" },
            { href: "/dashboard/goals", icon: Target, label: "Metas", color: "text-yellow-400" },
            { href: "/dashboard/investments", icon: TrendingUp, label: "Inversiones", color: "text-green-400" },
            { href: "/dashboard/reports", icon: FileText, label: "Informes", color: "text-gray-400" },
        ]
    },
    {
        title: "Carteras",
        items: [
            { href: "/dashboard/bank-accounts", icon: Banknote, label: "Cuentas Bancarias", color: "text-primary" },
            { href: "/dashboard/bank-cards", icon: CreditCard, label: "Tarjetas Bancarias", color: "text-orange-400" },
            { href: "/dashboard/savings-portfolio", icon: Landmark, label: "Ahorros", color: "text-emerald-400" },
            { href: "/dashboard/investments-portfolio", icon: Wallet, label: "Portafolio Inversión", color: "text-blue-400" },
        ]
    }
]

const allNavItems = navSections.flatMap(section => section.items);

export function Header() {
  const pathname = usePathname();
  const pageTitle = allNavItems.find(item => pathname.startsWith(item.href))?.label || "Panel";
                  
  const [isClient, setIsClient] = useState(false);
  const { 
    profiles, 
    filters,
    setFilters,
    availableYears 
  } = useContext(DataContext);
  const { logout } = useAuth();
  
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2000, i), 'LLLL', { locale: es }),
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isCalendarPage = pathname === '/dashboard/calendar';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
            {isClient ? <HoverMenu navSections={navSections} /> : (
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
                        <MobileSidebar navSections={navSections} />
                    </SheetContent>
                </Sheet>
            )}
          <h1 className="text-xl font-semibold hidden sm:block">{pathname.startsWith('/dashboard/profile') ? 'Perfil y Configuración' : pageTitle}</h1>
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
           <Link href={isCalendarPage ? "/dashboard/dashboard" : "/dashboard/calendar"}>
                <Button variant="ghost" size="icon">
                    {isCalendarPage ? <LayoutDashboard className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                </Button>
            </Link>
           <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
           </Button>
        </div>
      </div>
    </header>
  );
}

export function MobileSidebar({ navSections }: { navSections: any[] }) {
    const pathname = usePathname();

    return (
        <div className="p-4 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-6">
                <Wallet className="h-7 w-7" />
                <h1 className="font-headline">FA WALLET</h1>
            </div>

            <div className="flex flex-col gap-4">
                {navSections.map((section, index) => (
                    <div key={index}>
                         <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-2">{section.title}</h3>
                         <nav className="grid gap-1 text-base font-medium">
                            {section.items.map((item: any) => (
                                <Link
                                    href={item.href}
                                    key={item.label}
                                    className={`flex items-center gap-4 rounded-lg px-3 py-2.5 transition-all hover:text-primary ${pathname.startsWith(item.href) ? "bg-muted text-primary" : "text-muted-foreground"}`}
                                >
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                ))}
            </div>
            
            <div className="mt-auto flex flex-col gap-2 pt-6">
               <Link href="/dashboard/profile" className={`flex items-center gap-4 rounded-lg px-3 py-2.5 transition-all hover:text-primary ${pathname.startsWith("/dashboard/profile") ? "bg-muted text-primary" : "text-muted-foreground"}`}>
                    <User className="h-5 w-5" />
                    Perfil y Configuración
                </Link>
            </div>
        </div>
    )
}

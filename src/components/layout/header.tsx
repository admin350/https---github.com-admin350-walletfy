

'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Wallet, Settings, LayoutDashboard, List, CreditCard, Repeat, Landmark, Target, TrendingUp, ClipboardPen, Banknote, Building, FileText, Calendar, User, Bell, AlertTriangle, CheckCircle, Info, X, LogOut, Scale, PiggyBank, Globe, Eye, EyeOff } from "lucide-react";
import { usePathname } from "next/navigation";
import { HoverMenu } from './hover-menu';
import { useData } from "@/context/data-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format, getYear } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import type { AppNotification } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const navSections = [
    {
        title: "Planificación y Seguimiento",
        items: [
            { href: "/dashboard/dashboard", icon: LayoutDashboard, label: "Panel", color: "text-sky-400" },
            { href: "/dashboard/transactions", icon: List, label: "Transacciones", color: "text-orange-400" },
            { href: "/dashboard/fixed-expenses", icon: Repeat, label: "Gastos Fijos", color: "text-indigo-400" },
            { href: "/dashboard/debts", icon: CreditCard, label: "Deudas", color: "text-red-400" },
            { href: "/dashboard/subscriptions", icon: Repeat, label: "Suscripciones", color: "text-purple-400" },
            { href: "/dashboard/goals", icon: Target, label: "Metas", color: "text-yellow-400" },
            { href: "/dashboard/investments", icon: TrendingUp, label: "Inversiones", color: "text-green-400" },
            { href: "/dashboard/services", icon: Globe, label: "Servicios", color: "text-cyan-400" },
        ]
    },
    {
        title: "Análisis y Registros",
        items: [
            { href: "/dashboard/budget", icon: ClipboardPen, label: "Presupuesto", color: "text-rose-400" },
            { href: "/dashboard/calendar", icon: Calendar, label: "Calendario", color: "text-amber-400" },
            { href: "/dashboard/reports", icon: FileText, label: "Informes", color: "text-gray-400" },
            { href: "/dashboard/taxes", icon: Scale, label: "Impuestos", color: "text-teal-400" },
        ]
    },
    {
        title: "Carteras",
        items: [
            { href: "/dashboard/bank-accounts", icon: Landmark, label: "Cuentas Bancarias", color: "text-primary" },
            { href: "/dashboard/bank-cards", icon: CreditCard, label: "Tarjetas Bancarias", color: "text-orange-400" },
            { href: "/dashboard/savings-portfolio", icon: PiggyBank, label: "Cartera de Ahorros", color: "text-emerald-400" },
            { href: "/dashboard/investments-portfolio", icon: Wallet, label: "Portafolio Inversión", color: "text-blue-400" },
            { href: "/dashboard/tax-portfolio", icon: Scale, label: "Cartera Tributaria", color: "text-teal-400" },
            { href: "/dashboard/assets", icon: Building, label: "Activos Tangibles", color: "text-fuchsia-400" },
        ]
    }
]

const allNavItems = navSections.flatMap(section => section.items);

const NotificationIcon = ({ type }: { type: AppNotification['type']}) => {
    switch (type) {
        case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
        case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'info': return <Info className="h-4 w-4 text-blue-500" />;
        default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
}

const NotificationPanel = () => {
    const { notifications: initialNotifications } = useData();
    const [notifications, setNotifications] = useState(initialNotifications);

    useEffect(() => {
        setNotifications(initialNotifications);
    }, [initialNotifications]);

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.preventDefault();
        setNotifications([]);
    };

    const handleRemoveNotification = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.length;

    return (
        <>
         <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 justify-center text-xs">{unreadCount}</Badge>
                    )}
                </Button>
            </PopoverTrigger>
             <PopoverContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>Marcar como leídas</Button>
                    )}
                </div>
                <div className="space-y-2">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <Link href={n.link || '#'} key={n.id} className="block relative group">
                                <div className="text-sm p-3 rounded-md border flex gap-3 items-start hover:bg-muted/50">
                                    <NotificationIcon type={n.type} />
                                    <div className="flex-1">
                                        <p className="font-semibold leading-tight">{n.title}</p>
                                        <p className="text-xs text-muted-foreground">{n.description}</p>
                                    </div>
                                    <button onClick={(e) => handleRemoveNotification(e, n.id)} className="absolute top-1 right-1 p-0.5 rounded-full text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3"/>
                                    </button>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">No tienes notificaciones</p>
                    )}
                </div>
            </PopoverContent>
         </Popover>
        </>
    )
}

export function Header() {
  const pathname = usePathname();
  const pageTitle = allNavItems.find(item => pathname.startsWith(item.href))?.label || "Panel";
                  
  const [isClient, setIsClient] = useState(false);
  const { 
    profiles, 
    filters,
    setFilters,
    availableYears,
    logout,
    settings,
    updateSettings
  } = useData();
  
  const toggleSensitiveData = () => {
      updateSettings({ showSensitiveData: !settings.showSensitiveData });
  }

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
                                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
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
           <Link href="/dashboard/dashboard">
                <Button variant="ghost" size="icon">
                    <LayoutDashboard className="h-5 w-5" />
                </Button>
            </Link>
             <Button variant="ghost" size="icon" onClick={toggleSensitiveData}>
                {settings.showSensitiveData ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </Button>
           <Link href="/dashboard/calendar">
                <Button variant="ghost" size="icon">
                    <Calendar className="h-5 w-5" />
                </Button>
            </Link>
             <NotificationPanel />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Perfil y Configuración</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function MobileSidebar({ navSections }: { navSections: any[] }) {
    const pathname = usePathname();
    const { logout } = useData();

    return (
        <div className="p-4 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-6">
                <Wallet className="h-7 w-7" />
                <h1 className="font-headline">WALLETFY</h1>
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
                <Button variant="ghost" className="justify-start px-3 py-2.5" onClick={logout}>
                    <LogOut className="h-5 w-5 mr-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    )
}

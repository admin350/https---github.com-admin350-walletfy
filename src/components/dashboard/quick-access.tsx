
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Landmark, CreditCard, Repeat, ClipboardPen, Target, Wallet, List } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const quickAccessItems = [
    { href: "/dashboard/bank-accounts", icon: Landmark, label: "Cuentas", color: "text-green-400", shadow: "hover:shadow-[0_0_15px_#4ade80]" },
    { href: "/dashboard/bank-cards", icon: CreditCard, label: "Tarjetas", color: "text-orange-400", shadow: "hover:shadow-[0_0_15px_#f97316]" },
    { href: "/dashboard/transactions", icon: List, label: "Transacciones", color: "text-sky-400", shadow: "hover:shadow-[0_0_15px_#38bdf8]" },
    { href: "/dashboard/subscriptions", icon: Repeat, label: "Suscripciones", color: "text-purple-400", shadow: "hover:shadow-[0_0_15px_#c084fc]" },
    { href: "/dashboard/debts", icon: Banknote, label: "Deudas", color: "text-red-400", shadow: "hover:shadow-[0_0_15px_#f87171]" },
    { href: "/dashboard/budget", icon: ClipboardPen, label: "Presupuesto", color: "text-rose-400", shadow: "hover:shadow-[0_0_15px_#fb7185]" },
    { href: "/dashboard/savings-portfolio", icon: Landmark, label: "Ahorros", color: "text-emerald-400", shadow: "hover:shadow-[0_0_15px_#34d399]" },
    { href: "/dashboard/investments-portfolio", icon: Wallet, label: "Inversión", color: "text-blue-400", shadow: "hover:shadow-[0_0_15px_#60a5fa]" },
    { href: "/dashboard/fixed-expenses", icon: Repeat, label: "Gastos Fijos", color: "text-indigo-400", shadow: "hover:shadow-[0_0_15px_#818cf8]" },
];

export function QuickAccess() {
    return (
        <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4">
                <CardTitle>Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    {quickAccessItems.map(item => {
                        const Icon = item.icon;
                        return (
                             <Link href={item.href} key={item.label} className="group flex flex-col items-center justify-center space-y-2 p-2 rounded-lg transition-transform duration-300 ease-in-out hover:-translate-y-1">
                                <div className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background transition-all duration-300",
                                    item.color,
                                    item.shadow
                                )}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

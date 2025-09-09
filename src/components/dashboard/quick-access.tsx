
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Landmark, CreditCard, Repeat, ClipboardPen, Target } from "lucide-react";
import Link from "next/link";

const quickAccessItems = [
    { href: "/dashboard/bank-accounts", icon: Landmark, label: "Cuentas", color: "text-green-400" },
    { href: "/dashboard/bank-cards", icon: CreditCard, label: "Tarjetas", color: "text-orange-400" },
    { href: "/dashboard/debts", icon: Banknote, label: "Deudas", color: "text-red-400" },
    { href: "/dashboard/subscriptions", icon: Repeat, label: "Suscripciones", color: "text-purple-400" },
    { href: "/dashboard/budget", icon: ClipboardPen, label: "Presupuesto", color: "text-rose-400" },
    { href: "/dashboard/goals", icon: Target, label: "Metas", color: "text-yellow-400" },
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
                             <Link href={item.href} key={item.label} className="group flex flex-col items-center justify-center space-y-2 p-2 rounded-lg hover:bg-muted transition-colors">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-border group-hover:border-primary transition-colors ${item.color}`}>
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

'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsPortfolioDataTable } from "@/components/transactions/savings-portfolio-data-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Landmark, ArrowRightLeft, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalContributionsTable } from "@/components/goals/goal-contributions-table";
import type { GoalContribution } from "@/types";


export default function SavingsPortfolioPage() {
    const { bankAccounts, goalContributions, isLoading, formatCurrency } = useData();
    
    const savingsAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'savings'), [bankAccounts]);
    
    const totalSavings = savingsAccount?.balance ?? 0;

    const totalContributedToGoals = goalContributions.reduce((acc: number, c: GoalContribution) => acc + c.amount, 0);

    const availableSavings = totalSavings - totalContributedToGoals;

    const KpiSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
    
     if (!isLoading && !savingsAccount) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cartera de Ahorros no Configurada</CardTitle>
                    <CardDescription>
                       Para usar esta sección, debes designar una de tus cuentas bancarias como "Cartera de Ahorros".
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Ve a la sección de <a href="/dashboard/bank-accounts" className="text-primary underline">Cuentas Bancarias</a>, edita una cuenta existente o crea una nueva, y en el campo "Propósito de la Cuenta", selecciona "Cartera de Ahorros".
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <>
                    <KpiCard title="Saldo Total de Ahorro" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                    <KpiCard title="Total Aportado a Metas" value={<KpiSkeleton />} icon={ArrowRightLeft} description="Cargando..." />
                    <KpiCard title="Saldo Disponible para Aportar" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                    </>
                ) : (
                    <>
                    <KpiCard 
                        title="Saldo Total de Ahorro" 
                        value={<span className="text-green-500">{formatCurrency(totalSavings)}</span>} 
                        icon={Landmark} 
                        description={`En tu cuenta: ${savingsAccount?.name}`}
                    />
                     <KpiCard 
                        title="Total Aportado a Metas" 
                        value={<span className="text-red-500">{formatCurrency(totalContributedToGoals)}</span>} 
                        icon={ArrowRightLeft} 
                        description="Dinero de tu cartera de ahorros asignado a metas." 
                    />
                    <KpiCard
                        title="Saldo Disponible para Aportar"
                        value={<span className="text-green-500">{formatCurrency(availableSavings)}</span>}
                        icon={Wallet}
                        description="Ahorro total - Aportes a metas"
                    />
                    </>
                )}
             </div>
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Transferencias a Ahorros</CardTitle>
                    <CardDescription>
                        Aquí puedes ver el historial de todas tus transferencias hacia tu cuenta de ahorros.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SavingsPortfolioDataTable />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Registro de Aportes a Metas</CardTitle>
                    <CardDescription>
                        Historial de todas las transferencias desde tu cartera de ahorros hacia tus metas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <GoalContributionsTable />
                </CardContent>
            </Card>
        </div>
    )
}

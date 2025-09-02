
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsPortfolioDataTable } from "@/components/transactions/savings-portfolio-data-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Landmark, ArrowRightLeft, Wallet } from "lucide-react";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalContributionsTable } from "@/components/goals/goal-contributions-table";


export default function SavingsPortfolioPage() {
    const { transactions, goalContributions, isLoading } = useContext(DataContext);
    const savingsTransactions = transactions.filter(t => t.type === 'transfer');
    const totalSavings = savingsTransactions.reduce((acc, t) => acc + t.amount, 0);

    const totalContributedToGoals = goalContributions.reduce((acc, c) => acc + c.amount, 0);

    const availableSavings = totalSavings - totalContributedToGoals;

    const KpiSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )

    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <>
                    <KpiCard title="Ahorro Total Acumulado" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                    <KpiCard title="Total Aportado a Metas" value={<KpiSkeleton />} icon={ArrowRightLeft} description="Cargando..." />
                    <KpiCard title="Saldo Disponible para Aportar" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                    </>
                ) : (
                    <>
                    <KpiCard 
                        title="Ahorro Total Acumulado" 
                        value={<span className="text-green-500">${totalSavings.toLocaleString('es-CL')}</span>} 
                        icon={Landmark} 
                        description="Suma de todas tus transferencias de ahorro" 
                    />
                     <KpiCard 
                        title="Total Aportado a Metas" 
                        value={<span className="text-red-500">${totalContributedToGoals.toLocaleString('es-CL')}</span>} 
                        icon={ArrowRightLeft} 
                        description="Dinero de tu cartera de ahorros asignado a metas." 
                    />
                    <KpiCard
                        title="Saldo Disponible para Aportar"
                        value={<span className="text-green-500">${availableSavings.toLocaleString('es-CL')}</span>}
                        icon={Wallet}
                        description="Ahorro total - Aportes a metas"
                    />
                    </>
                )}
             </div>
            <Card>
                <CardHeader>
                    <CardTitle>Cartera de Ahorros</CardTitle>
                    <CardDescription>
                        Aquí puedes ver el historial de todas tus transferencias de ahorro.
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

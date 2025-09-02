
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsPortfolioDataTable } from "@/components/transactions/savings-portfolio-data-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Landmark } from "lucide-react";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";


export default function SavingsPortfolioPage() {
    const { transactions, isLoading } = useContext(DataContext);
    const savingsTransactions = transactions.filter(t => t.type === 'transfer');
    const totalSavings = savingsTransactions.reduce((acc, t) => acc + t.amount, 0);

    const KpiSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )

    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    <KpiCard title="Ahorro Total Acumulado" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                ) : (
                    <KpiCard 
                        title="Ahorro Total Acumulado" 
                        value={`$${totalSavings.toLocaleString('es-CL')}`} 
                        icon={Landmark} 
                        description="Suma de todas tus transferencias de ahorro" 
                    />
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
        </div>
    )
}

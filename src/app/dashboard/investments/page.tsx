
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, Wallet, BarChart } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AddInvestmentDialog } from "@/components/investments/add-investment-dialog";
import { InvestmentsWidget } from "@/components/investments/investments-widget";
import { InvestmentContributionsTable } from "@/components/investments/investment-contributions-table";
import type { Investment } from "@/types";

export default function InvestmentsPage() {
    const { investments, isLoading, formatCurrency } = useData();
    
    const investmentAssets = investments.filter(inv => inv.purpose === 'investment');

    const totalInvested = investmentAssets.reduce((acc: number, investment: Investment) => acc + investment.initialAmount, 0);
    const totalCurrentValue = investmentAssets.reduce((acc: number, investment: Investment) => acc + investment.currentValue, 0);
    const totalProfit = totalCurrentValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    
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
                        <KpiCard title="Total Invertido" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                        <KpiCard title="Valor Actual" value={<KpiSkeleton />} icon={TrendingUp} description="Cargando..." />
                        <KpiCard title="Ganancia/Pérdida" value={<KpiSkeleton />} icon={BarChart} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            title="Total Invertido" 
                            value={formatCurrency(totalInvested)}
                            icon={Wallet} 
                            description="Suma de todo el capital inicial invertido."
                        />
                        <KpiCard 
                            title="Valor Actual del Portafolio" 
                            value={formatCurrency(totalCurrentValue)}
                            icon={TrendingUp}
                            description="Valor de mercado actual de tus inversiones."
                        />
                        <KpiCard
                            title="Ganancia / Pérdida"
                             value={<span className={totalProfit >= 0 ? "text-green-400" : "text-red-400"}>{formatCurrency(totalProfit)} ({profitPercentage.toFixed(2)}%)</span>}
                            icon={BarChart}
                            description="Rendimiento total de tu portafolio."
                        />
                    </>
                )}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Activos de Inversión</CardTitle>
                        <CardDescription>
                            Define, sigue y gestiona tus activos de inversión para el crecimiento de tu capital.
                        </CardDescription>
                    </div>
                     <AddInvestmentDialog purpose="investment">
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddInvestmentDialog>
                </CardHeader>
                <CardContent>
                    <InvestmentsWidget purpose="investment" />
                </CardContent>
            </Card>

             <Card>
                 <CardHeader>
                    <CardTitle>Registro de Aportes a Inversiones</CardTitle>
                    <CardDescription>
                        Historial de todos los aportes desde tu cartera de inversión hacia tus activos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvestmentContributionsTable purpose="investment" />
                </CardContent>
            </Card>
        </div>
    )
}

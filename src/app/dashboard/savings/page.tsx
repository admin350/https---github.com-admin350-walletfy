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

export default function SavingsPage() {
    const { investments, isLoading, formatCurrency } = useData();
    
    const savingsInstruments = investments.filter(inv => inv.purpose === 'saving');

    const totalSaved = savingsInstruments.reduce((acc: number, investment: Investment) => acc + investment.initialAmount, 0);
    const totalCurrentValue = savingsInstruments.reduce((acc: number, investment: Investment) => acc + investment.currentValue, 0);
    const totalProfit = totalCurrentValue - totalSaved;
    const profitPercentage = totalSaved > 0 ? (totalProfit / totalSaved) * 100 : 0;
    
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
                        <KpiCard title="Total Ahorrado en Instrumentos" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                        <KpiCard title="Valor Actual de Ahorros" value={<KpiSkeleton />} icon={TrendingUp} description="Cargando..." />
                        <KpiCard title="Ganancia Total de Ahorros" value={<KpiSkeleton />} icon={BarChart} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            title="Total Ahorrado en Instrumentos" 
                            value={formatCurrency(totalSaved)}
                            icon={Wallet} 
                            description="Suma de todo el capital inicial en instrumentos de ahorro."
                        />
                        <KpiCard 
                            title="Valor Actual de Ahorros" 
                            value={formatCurrency(totalCurrentValue)} 
                            icon={TrendingUp}
                            description="Valor de mercado actual de tus ahorros."
                        />
                        <KpiCard
                            title="Ganancia / Pérdida de Ahorros"
                             value={<span className={totalProfit >= 0 ? "text-green-400" : "text-red-400"}>{formatCurrency(totalProfit)} ({profitPercentage.toFixed(2)}%)</span>}
                            icon={BarChart}
                            description="Rendimiento total de tus ahorros."
                        />
                    </>
                )}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Instrumentos de Ahorro</CardTitle>
                        <CardDescription>
                            Define, sigue y gestiona tus instrumentos de ahorro como depósitos a plazo o fondos mutuos.
                        </CardDescription>
                    </div>
                     <AddInvestmentDialog purpose="saving">
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddInvestmentDialog>
                </CardHeader>
                <CardContent>
                    <InvestmentsWidget purpose="saving" />
                </CardContent>
            </Card>

             <Card>
                 <CardHeader>
                    <CardTitle>Registro de Aportes a Instrumentos de Ahorro</CardTitle>
                    <CardDescription>
                        Historial de todos los aportes desde tu cartera de ahorros hacia tus instrumentos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvestmentContributionsTable purpose="saving" />
                </CardContent>
            </Card>
        </div>
    )
}



'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, Wallet, BarChart } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AddInvestmentDialog } from "@/components/investments/add-investment-dialog";
import { InvestmentsWidget } from "@/components/investments/investments-widget";
import { InvestmentContributionsTable } from "@/components/investments/investment-contributions-table";

export default function InvestmentsPage() {
    const { investments, isLoading } = useContext(DataContext);
    
    const totalInvested = investments.reduce((acc, investment) => acc + investment.initialAmount, 0);
    const totalCurrentValue = investments.reduce((acc, investment) => acc + investment.currentValue, 0);
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
                            value={<span className="text-blue-400">${totalInvested.toLocaleString('es-CL')}</span>}
                            icon={Wallet} 
                            iconClassName="text-blue-400"
                            description="Suma de todo el capital inicial invertido."
                        />
                        <KpiCard 
                            title="Valor Actual del Portafolio" 
                            value={<span className="text-green-400">${totalCurrentValue.toLocaleString('es-CL')}</span>} 
                            icon={TrendingUp}
                            iconClassName="text-green-400"
                            description="Valor de mercado actual de tus inversiones."
                        />
                        <KpiCard
                            title="Ganancia / Pérdida"
                             value={<span className={totalProfit >= 0 ? "text-green-400" : "text-red-400"}>${totalProfit.toLocaleString('es-CL')} ({profitPercentage.toFixed(2)}%)</span>}
                            icon={BarChart}
                            iconClassName={totalProfit >= 0 ? "text-green-400" : "text-red-400"}
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
                            Define, sigue y gestiona tus activos de inversión.
                        </CardDescription>
                    </div>
                     <AddInvestmentDialog>
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddInvestmentDialog>
                </CardHeader>
                <CardContent>
                    <InvestmentsWidget />
                </CardContent>
            </Card>

             <Card>
                 <CardHeader>
                    <CardTitle>Registro de Aportes a Inversiones</CardTitle>
                    <CardDescription>
                        Historial de todos los aportes desde tu cartera de ahorros hacia tus inversiones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvestmentContributionsTable />
                </CardContent>
            </Card>
        </div>
    )
}

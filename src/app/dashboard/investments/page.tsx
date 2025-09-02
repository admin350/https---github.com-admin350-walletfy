
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, Wallet, BarChart } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
                        <CardTitle>Mi Portafolio de Inversiones</CardTitle>
                        <CardDescription>
                            Gestiona y sigue el rendimiento de tus activos de inversión.
                        </CardDescription>
                    </div>
                     <Link href="/dashboard/investments-portfolio">
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4 text-green-400" />
                            Gestionar Portafolio
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground p-4">Próximamente: Gráficos de rendimiento y análisis detallado.</p>
                </CardContent>
            </Card>
        </div>
    )
}

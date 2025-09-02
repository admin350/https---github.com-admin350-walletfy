
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Landmark, ArrowRightLeft, Wallet } from "lucide-react";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { InvestmentContributionsTable } from "@/components/investments/investment-contributions-table";
import { InvestmentsPortfolioDataTable } from "@/components/transactions/investments-portfolio-data-table";


export default function InvestmentsPortfolioPage() {
    const { transactions, investmentContributions, isLoading } = useContext(DataContext);
    const investmentTransferTransactions = transactions.filter(t => t.type === 'transfer-investment');
    const totalTransferredToInvestment = investmentTransferTransactions.reduce((acc, t) => acc + t.amount, 0);

    const totalContributedToAssets = investmentContributions.reduce((acc, c) => acc + c.amount, 0);

    const availableToInvest = totalTransferredToInvestment - totalContributedToAssets;

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
                    <KpiCard title="Total Transferido a Inversión" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                    <KpiCard title="Total Aportado a Activos" value={<KpiSkeleton />} icon={ArrowRightLeft} description="Cargando..." />
                    <KpiCard title="Saldo Disponible para Invertir" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                    </>
                ) : (
                    <>
                    <KpiCard 
                        title="Total Transferido a Inversión" 
                        value={<span className="text-blue-400">${totalTransferredToInvestment.toLocaleString('es-CL')}</span>} 
                        icon={Landmark}
                        iconClassName="text-blue-400" 
                        description="Suma de todas tus transferencias a inversión" 
                    />
                     <KpiCard 
                        title="Total Aportado a Activos" 
                        value={<span className="text-red-500">${totalContributedToAssets.toLocaleString('es-CL')}</span>} 
                        icon={ArrowRightLeft}
                        iconClassName="text-red-400"
                        description="Dinero de tu cartera de inversión asignado a activos." 
                    />
                    <KpiCard
                        title="Saldo Disponible para Invertir"
                        value={<span className="text-green-500">${availableToInvest.toLocaleString('es-CL')}</span>}
                        icon={Wallet}
                        iconClassName="text-green-400"
                        description="Total transferido - Aportes a activos"
                    />
                    </>
                )}
             </div>
            <Card>
                <CardHeader>
                    <CardTitle>Cartera de Inversión</CardTitle>
                    <CardDescription>
                        Aquí puedes ver el historial de todas tus transferencias de capital para invertir.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvestmentsPortfolioDataTable />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Registro de Aportes a Activos</CardTitle>
                    <CardDescription>
                        Historial de todas las transferencias desde tu cartera de inversión hacia tus activos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvestmentContributionsTable />
                </CardContent>
            </Card>
        </div>
    )
}

'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Landmark, ArrowRightLeft, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { InvestmentContributionsTable } from "@/components/investments/investment-contributions-table";
import { InvestmentsPortfolioDataTable } from "@/components/transactions/investments-portfolio-data-table";
import type { InvestmentContribution } from "@/types";


export default function InvestmentPortfolioPage() {
    const { bankAccounts, investmentContributions, isLoading, formatCurrency } = useData();
    
    const investmentAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'investment'), [bankAccounts]);
    
    const totalTransferredToInvestment = investmentAccount?.balance ?? 0;

    const totalContributedToAssets = investmentContributions.reduce((acc: number, c: InvestmentContribution) => acc + c.amount, 0);

    const availableToInvest = totalTransferredToInvestment - totalContributedToAssets;

    const KpiSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )

    if (!isLoading && !investmentAccount) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cartera de Inversión no Configurada</CardTitle>
                    <CardDescription>
                       Para usar esta sección, debes designar una de tus cuentas bancarias como "Cartera de Inversión".
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Ve a la sección de <a href="/dashboard/bank-accounts" className="text-primary underline">Cuentas Bancarias</a>, edita una cuenta existente o crea una nueva, y en el campo "Propósito de la Cuenta", selecciona "Cartera de Inversión".
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
                    <KpiCard title="Capital Total para Inversión" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                    <KpiCard title="Total Aportado a Activos" value={<KpiSkeleton />} icon={ArrowRightLeft} description="Cargando..." />
                    <KpiCard title="Saldo Disponible para Invertir" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                    </>
                ) : (
                    <>
                    <KpiCard 
                        title="Capital Total para Inversión" 
                        value={<span className="text-blue-400">{formatCurrency(totalTransferredToInvestment)}</span>} 
                        icon={Landmark}
                        iconClassName="text-blue-400" 
                        description={`En tu cuenta: ${investmentAccount?.name}`}
                    />
                     <KpiCard 
                        title="Total Aportado a Activos" 
                        value={<span className="text-red-500">{formatCurrency(totalContributedToAssets)}</span>} 
                        icon={ArrowRightLeft}
                        iconClassName="text-red-400"
                        description="Dinero de tu cartera de inversión asignado a activos." 
                    />
                    <KpiCard
                        title="Saldo Disponible para Invertir"
                        value={<span className="text-green-500">{formatCurrency(availableToInvest)}</span>}
                        icon={Wallet}
                        iconClassName="text-green-400"
                        description="Capital total - Aportes a activos"
                    />
                    </>
                )}
             </div>
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Transferencias a Inversión</CardTitle>
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

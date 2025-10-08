
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsPortfolioDataTable } from "@/components/transactions/savings-portfolio-data-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Landmark, ArrowRightLeft, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalContributionsTable } from "@/components/goals/goal-contributions-table";
import type { GoalContribution, InvestmentContribution } from "@/types";
import { InvestmentContributionsTable } from "@/components/investments/investment-contributions-table";
import { BankAccountComponent } from "@/components/wallets/bank-account-component";
import Link from "next/link";


export default function SavingsPortfolioPage() {
    const { bankAccounts, goalContributions, investmentContributions, isLoading, formatCurrency } = useData();
    
    const savingsAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'savings'), [bankAccounts]);
    
    const totalSavings = savingsAccount?.balance ?? 0;

    const totalContributedToGoals = goalContributions.reduce((acc: number, c: GoalContribution) => acc + c.amount, 0);
    const totalContributedToInstruments = investmentContributions.filter(c => c.purpose === 'saving').reduce((acc: number, c: InvestmentContribution) => acc + c.amount, 0);

    const availableSavings = totalSavings;

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
                       Para usar esta sección, debes designar una de tus cuentas bancarias como &quot;Cartera de Ahorros&quot;.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Ve a la sección de <Link href="/dashboard/bank-accounts" className="text-primary underline">Cuentas Bancarias</Link>, edita una cuenta existente o crea una nueva, y en el campo &quot;Propósito de la Cuenta&quot;, selecciona &quot;Cartera de Ahorros&quot;.
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
                    <KpiCard title="Saldo Total en Cartera" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                    <KpiCard title="Total Aportado a Metas" value={<KpiSkeleton />} icon={ArrowRightLeft} description="Cargando..." />
                    <KpiCard title="Total Aportado a Instrumentos" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                    </>
                ) : (
                    <>
                    <KpiCard 
                        title="Saldo Total en Cartera" 
                        value={formatCurrency(availableSavings)} 
                        icon={Landmark} 
                        description={`Balance total de tu cartera de ahorros.`}
                    />
                     <KpiCard 
                        title="Total Aportado a Metas" 
                        value={<span className="text-red-500">{formatCurrency(totalContributedToGoals)}</span>} 
                        icon={ArrowRightLeft}
                        description="Dinero de tu cartera de ahorros asignado a metas." 
                    />
                    <KpiCard
                        title="Total Aportado a Instrumentos"
                        value={<span className="text-red-500">{formatCurrency(totalContributedToInstruments)}</span>}
                        icon={Wallet}
                        description="Dinero de tu cartera asignado a instrumentos de ahorro."
                    />
                    </>
                )}
             </div>

            {savingsAccount && (
                <Card>
                    <CardHeader>
                        <CardTitle>Cuenta Designada para Ahorros</CardTitle>
                        <CardDescription>
                            Esta es la cuenta que has asignado como tu cartera de ahorros principal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-2xl mx-auto">
                             <BankAccountComponent account={savingsAccount}/>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Entradas a Cartera de Ahorros</CardTitle>
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
                    <CardTitle>Registro de Salidas: Aportes a Metas</CardTitle>
                    <CardDescription>
                        Historial de todas las transferencias desde tu cartera de ahorros hacia tus metas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <GoalContributionsTable />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Registro de Salidas: Aportes a Instrumentos de Ahorro</CardTitle>
                    <CardDescription>
                        Historial de todas las transferencias desde tu cartera de ahorros hacia tus instrumentos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvestmentContributionsTable purpose="saving" />
                </CardContent>
            </Card>
        </div>
    )
}

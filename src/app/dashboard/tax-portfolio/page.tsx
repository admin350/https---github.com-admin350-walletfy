
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Landmark, ArrowRightLeft, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { TaxPortfolioDataTable } from "@/components/transactions/tax-portfolio-data-table";
import { TaxPaymentsTable } from "@/components/transactions/tax-payments-table";
import Link from "next/link";


export default function TaxPortfolioPage() {
    const { bankAccounts, taxPayments, isLoading, formatCurrency } = useData();
    
    const taxAccount = useMemo(() => bankAccounts.find(acc => acc.purpose === 'tax'), [bankAccounts]);
    
    const totalTransferredToTax = taxAccount?.balance ?? 0;

    const totalPaidInTaxes = (taxPayments || []).reduce((acc, p) => acc + p.amount, 0);

    const availableToPay = totalTransferredToTax - totalPaidInTaxes;

    const KpiSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
    
     if (!isLoading && !taxAccount) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cartera Tributaria no Configurada</CardTitle>
                    <CardDescription>
                       Para usar esta sección, debes designar una de tus cuentas bancarias como &quot;Cartera Tributaria&quot;.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Ve a la sección de <Link href="/dashboard/bank-accounts" className="text-primary underline">Cuentas Bancarias</Link>, edita una cuenta existente o crea una nueva, y en el campo &quot;Propósito de la Cuenta&quot;, selecciona &quot;Cartera Tributaria&quot;.
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
                    <KpiCard title="Capital Total para Impuestos" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
                    <KpiCard title="Total Pagado en Impuestos (F29)" value={<KpiSkeleton />} icon={ArrowRightLeft} description="Cargando..." />
                    <KpiCard title="Saldo Disponible para Pagar" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
                    </>
                ) : (
                    <>
                    <KpiCard 
                        title="Capital Total para Impuestos" 
                        value={formatCurrency(totalTransferredToTax)} 
                        icon={Landmark} 
                        description={`En tu cuenta: ${taxAccount?.name}`}
                    />
                     <KpiCard 
                        title="Total Pagado en Impuestos (F29)" 
                        value={<span className="text-red-500">{formatCurrency(totalPaidInTaxes)}</span>} 
                        icon={ArrowRightLeft} 
                        description="Dinero de tu cartera de impuestos ya pagado." 
                    />
                    <KpiCard
                        title="Saldo Disponible para Pagar"
                        value={<span className="text-green-500">{formatCurrency(availableToPay)}</span>}
                        icon={Wallet}
                        description="Capital total - Pagos de impuestos"
                    />
                    </>
                )}
             </div>
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Transferencias a Cartera Tributaria</CardTitle>
                    <CardDescription>
                        Aquí puedes ver el historial de todas tus transferencias de capital para pagar impuestos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TaxPortfolioDataTable />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Registro de Pagos de Impuestos (F29)</CardTitle>
                    <CardDescription>
                        Historial de todos los pagos de impuestos realizados desde esta cartera.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TaxPaymentsTable />
                </CardContent>
            </Card>
        </div>
    )
}

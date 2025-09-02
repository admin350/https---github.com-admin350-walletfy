
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DebtsDataTable } from "@/components/transactions/debts-data-table";
import { Button } from "@/components/ui/button";
import { AddDebtDialog } from "@/components/transactions/add-debt-dialog";
import { Banknote, HandCoins, PlusCircle, Scale } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function DebtsPage() {
    const { debts, isLoading } = useContext(DataContext);

    const totalOwed = debts.reduce((acc, debt) => acc + debt.totalAmount, 0);
    const totalPaid = debts.reduce((acc, debt) => acc + debt.paidAmount, 0);
    const remainingDebt = totalOwed - totalPaid;

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
                        <KpiCard title="Deuda Total" value={<KpiSkeleton />} icon={Scale} description="Cargando..." />
                        <KpiCard title="Total Pagado" value={<KpiSkeleton />} icon={HandCoins} description="Cargando..." />
                        <KpiCard title="Saldo Restante" value={<KpiSkeleton />} icon={Banknote} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            title="Deuda Total" 
                            value={`$${totalOwed.toLocaleString('es-CL')}`} 
                            icon={Scale} 
                            description="Monto original de todas tus deudas"
                        />
                         <KpiCard 
                            title="Total Pagado" 
                            value={`$${totalPaid.toLocaleString('es-CL')}`} 
                            icon={HandCoins} 
                            description="Suma de todos los abonos realizados" 
                        />
                        <KpiCard
                            title="Saldo Restante"
                            value={`$${remainingDebt.toLocaleString('es-CL')}`}
                            icon={Banknote}
                            description="Lo que queda por pagar del total"
                        />
                    </>
                )}
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Deudas</CardTitle>
                        <CardDescription>
                            Registra y gestiona tus deudas como préstamos o hipotecas.
                        </CardDescription>
                    </div>
                    <AddDebtDialog>
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Deuda
                        </Button>
                    </AddDebtDialog>
                </CardHeader>
                <CardContent>
                    <DebtsDataTable />
                </CardContent>
            </Card>
        </div>
    )
}

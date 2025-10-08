'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DebtsDataTable } from "@/components/transactions/debts-data-table";
import { Button } from "@/components/ui/button";
import { AddDebtDialog } from "@/components/transactions/add-debt-dialog";
import { Banknote, HandCoins, PlusCircle, Scale } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isPast } from "date-fns";
import type { Debt } from "@/types";

export default function DebtsPage() {
    const { debts, isLoading, formatCurrency } = useData();

    const totalOwed = debts.reduce((acc: number, debt: Debt) => acc + debt.totalAmount, 0);
    const totalPaid = debts.reduce((acc: number, debt: Debt) => acc + debt.paidAmount, 0);
    const remainingDebt = totalOwed - totalPaid;
    
    const overdueDebts = debts.filter((d: Debt) => isPast(d.dueDate) && d.paidAmount < d.totalAmount);
    const activeDebts = debts.filter((d: Debt) => d.paidAmount < d.totalAmount && !overdueDebts.some(od => od.id === d.id));
    const paidDebts = debts.filter((d: Debt) => d.paidAmount >= d.totalAmount);

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
                            value={<span className="text-red-500">{formatCurrency(totalOwed)}</span>} 
                            icon={Scale} 
                            description="Monto original de todas tus deudas"
                        />
                         <KpiCard 
                            title="Total Pagado" 
                            value={<span className="text-green-500">{formatCurrency(totalPaid)}</span>} 
                            icon={HandCoins}
                            description="Suma de todos los abonos realizados" 
                        />
                        <KpiCard
                            title="Saldo Restante"
                            value={<span className="text-red-500">{formatCurrency(remainingDebt)}</span>}
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
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddDebtDialog>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="active">
                         <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overdue">Vencidas</TabsTrigger>
                            <TabsTrigger value="active">Activas</TabsTrigger>
                            <TabsTrigger value="completed">Pagadas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overdue" className="mt-4">
                            <DebtsDataTable debts={overdueDebts} />
                        </TabsContent>
                        <TabsContent value="active" className="mt-4">
                            <DebtsDataTable debts={activeDebts} />
                        </TabsContent>
                        <TabsContent value="completed" className="mt-4">
                            <DebtsDataTable debts={paidDebts} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

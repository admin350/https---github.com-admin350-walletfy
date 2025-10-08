
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, PlusCircle, CircleDollarSign, Percent } from "lucide-react";
import { SubscriptionsDataTable } from "@/components/transactions/subscriptions-data-table";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";
import { useData } from "@/context/data-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isThisMonth, isFuture, getMonth, getYear } from "date-fns";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Subscription, Transaction } from "@/types";

export default function SubscriptionsPage() {
    const { subscriptions, transactions, isLoading, formatCurrency } = useData();
    const today = new Date();
    const currentMonth = getMonth(today);
    const currentYear = getYear(today);

    const activeSubscriptions = subscriptions.filter((s: Subscription) => s.status === 'active');
    const cancelledSubscriptions = subscriptions.filter((s: Subscription) => s.status === 'cancelled');

    // Vencidas: Fecha de pago es anterior al mes actual Y no se ha pagado en el mes que correspondía.
    const overdueSubscriptions = activeSubscriptions.filter((s: Subscription) => {
        const dueDate = new Date(s.dueDate);
        const dueMonth = getMonth(dueDate);
        const dueYear = getYear(dueDate);
        // Is the due date in the past relative to the current month/year?
        return (dueYear < currentYear) || (dueYear === currentYear && dueMonth < currentMonth);
    });
    
    // Este Mes: (1) Vence este mes Y no está pagada O (2) Fue pagada en este período.
    const thisMonthSubscriptions = activeSubscriptions.filter((s: Subscription) => {
        const dueDate = new Date(s.dueDate);
        const isDueThisMonth = isThisMonth(dueDate);
        
        // It was paid in the current period
        if (s.paidThisPeriod && s.lastPaymentMonth === currentMonth && s.lastPaymentYear === currentYear) {
            return true;
        }
        
        // It is due this month and not yet paid for this period
        if (isDueThisMonth && !s.paidThisPeriod) {
            return true;
        }

        return false;
    });


    // Próximas: Fecha es futura y no es de este mes.
    const upcomingSubscriptions = activeSubscriptions.filter((s: Subscription) => {
        const dueDate = new Date(s.dueDate);
        return isFuture(dueDate) && !isThisMonth(dueDate);
    });
    
    const totalActiveSubscriptions = activeSubscriptions.length;
    const totalMonthlyCost = activeSubscriptions.reduce((acc: number, sub: Subscription) => acc + sub.amount, 0);

    const totalExpenses = transactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((acc: number, t: Transaction) => acc + t.amount, 0);

    const expenseParticipation = totalExpenses > 0 ? (totalMonthlyCost / totalExpenses) * 100 : 0;

    const KpiSkeleton = () => (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )

    return (
        <div className="grid gap-6">
             <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <>
                        <KpiCard title="Suscripciones Activas" value={<KpiSkeleton />} icon={ListChecks} description="Cargando..." />
                        <KpiCard title="Gasto Mensual Total" value={<KpiSkeleton />} icon={CircleDollarSign} description="Cargando..." />
                        <KpiCard title="Participación en Egresos" value={<KpiSkeleton />} icon={Percent} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard
                            title="Suscripciones Activas"
                            value={totalActiveSubscriptions}
                            icon={ListChecks}
                            description="Total de servicios recurrentes activos."
                        />
                        <KpiCard
                            title="Gasto Mensual Total"
                            value={formatCurrency(totalMonthlyCost)}
                            icon={CircleDollarSign}
                            description="Suma de todos tus gastos recurrentes."
                        />
                         <KpiCard
                            title="Participación en Egresos"
                            value={`${expenseParticipation.toFixed(1)}%`}
                            icon={Percent}
                            description="Porcentaje del total de egresos del período."
                        />
                    </>
                )}
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                        <CardTitle>Suscripciones</CardTitle>
                        <CardDescription>
                            Rastrea tus pagos recurrentes como Netflix, Spotify, etc.
                        </CardDescription>
                    </div>
                    <AddSubscriptionDialog>
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddSubscriptionDialog>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="this-month">
                         <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overdue">Vencidas</TabsTrigger>
                            <TabsTrigger value="this-month">Este Mes</TabsTrigger>
                            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overdue" className="mt-4">
                           <SubscriptionsDataTable subscriptions={overdueSubscriptions} tab="overdue" />
                        </TabsContent>
                        <TabsContent value="this-month" className="mt-4">
                             <SubscriptionsDataTable subscriptions={thisMonthSubscriptions} tab="this-month" />
                        </TabsContent>
                         <TabsContent value="upcoming" className="mt-4">
                             <SubscriptionsDataTable subscriptions={upcomingSubscriptions} tab="upcoming" />
                        </TabsContent>
                         <TabsContent value="cancelled" className="mt-4">
                             <SubscriptionsDataTable subscriptions={cancelledSubscriptions} tab="cancelled" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

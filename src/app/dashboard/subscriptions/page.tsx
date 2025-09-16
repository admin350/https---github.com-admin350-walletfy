
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, PlusCircle, CalendarClock, CircleDollarSign, Percent } from "lucide-react";
import { SubscriptionsDataTable } from "@/components/transactions/subscriptions-data-table";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";
import { useData } from "@/context/data-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isPast, isThisMonth, isFuture, startOfToday, format } from "date-fns";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { es } from "date-fns/locale";
import type { Subscription, Transaction } from "@/types";

export default function SubscriptionsPage() {
    const { subscriptions, transactions, isLoading, formatCurrency } = useData();
    const today = startOfToday();

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled');

    // Vencidas: Fecha es anterior al día de hoy y no es de este mes.
    const overdueSubscriptions = activeSubscriptions.filter(s => isPast(s.dueDate) && !isThisMonth(s.dueDate));

    // Este Mes: Fecha está en el mes actual.
    const thisMonthSubscriptions = activeSubscriptions.filter(s => isThisMonth(s.dueDate));

    // Próximas: Fecha es futura y no es de este mes.
    const upcomingSubscriptions = activeSubscriptions.filter(s => isFuture(s.dueDate) && !isThisMonth(s.dueDate));
    
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
                            iconClassName="text-purple-400"
                            description="Total de servicios recurrentes activos."
                        />
                        <KpiCard
                            title="Gasto Mensual Total"
                            value={formatCurrency(totalMonthlyCost)}
                            icon={CircleDollarSign}
                            iconClassName="text-purple-400"
                            description="Suma de todos tus gastos recurrentes."
                        />
                         <KpiCard
                            title="Participación en Egresos"
                            value={`${expenseParticipation.toFixed(1)}%`}
                            icon={Percent}
                            iconClassName="text-purple-400"
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

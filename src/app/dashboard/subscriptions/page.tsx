
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { SubscriptionsDataTable } from "@/components/transactions/subscriptions-data-table";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isPast, isThisMonth, isFuture, startOfMonth, startOfToday } from "date-fns";

export default function SubscriptionsPage() {
    const { subscriptions } = useContext(DataContext);
    const today = startOfToday();
    const startOfCurrentMonth = startOfMonth(today);

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled');

    // Vencidas: Fecha es anterior al inicio del mes actual.
    const overdueSubscriptions = activeSubscriptions.filter(s => isPast(s.dueDate) && !isThisMonth(s.dueDate));

    // Este Mes: Fecha está en el mes actual.
    const thisMonthSubscriptions = activeSubscriptions.filter(s => isThisMonth(s.dueDate));

    // Próximas: Fecha es futura y no es de este mes.
    const upcomingSubscriptions = activeSubscriptions.filter(s => isFuture(s.dueDate) && !isThisMonth(s.dueDate));

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                        <CardTitle>Suscripciones</CardTitle>
                        <CardDescription>
                            Rastrea tus pagos recurrentes como Netflix, Spotify, etc.
                        </CardDescription>
                    </div>
                    <AddSubscriptionDialog>
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4 text-purple-400" />
                            Añadir Suscripción
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

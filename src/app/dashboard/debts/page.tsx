import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DebtsDataTable } from "@/components/transactions/debts-data-table";
import { Button } from "@/components/ui/button";
import { AddDebtDialog } from "@/components/transactions/add-debt-dialog";
import { PlusCircle } from "lucide-react";
import { SubscriptionsDataTable } from "@/components/transactions/subscriptions-data-table";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";

export default function DebtsPage() {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
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
                           <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Suscripción
                        </Button>
                    </AddSubscriptionDialog>
                </CardHeader>
                <CardContent>
                    <SubscriptionsDataTable />
                </CardContent>
            </Card>
        </div>
    )
}

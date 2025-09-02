
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { SubscriptionsDataTable } from "@/components/transactions/subscriptions-data-table";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";

export default function SubscriptionsPage() {
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
                    <SubscriptionsDataTable />
                </CardContent>
            </Card>
        </div>
    )
}

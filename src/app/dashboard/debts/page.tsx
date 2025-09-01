import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingPaymentsWidget } from "@/components/dashboard/upcoming-payments-widget";
import { DebtsWidget } from "@/components/dashboard/debts-widget";

export default function DebtsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Deudas</CardTitle>
                     <CardDescription>
                        Registra y gestiona tus deudas como préstamos o hipotecas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DebtsWidget />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Suscripciones</CardTitle>
                     <CardDescription>
                        Rastrea tus pagos recurrentes como Netflix, Spotify, etc.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpcomingPaymentsWidget />
                </CardContent>
            </Card>
        </div>
    )
}

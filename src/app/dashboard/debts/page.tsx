import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingPaymentsWidget } from "@/components/dashboard/upcoming-payments-widget";

export default function DebtsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Deudas y Suscripciones</CardTitle>
                     <CardDescription>
                        Un módulo para registrar deudas con monto total, tasa de interés y pago mensual, y para rastrear pagos recurrentes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpcomingPaymentsWidget />
                </CardContent>
            </Card>
        </div>
    )
}

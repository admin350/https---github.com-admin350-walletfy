import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FixedExpensesWidget } from "@/components/dashboard/fixed-expenses-widget";

export default function FixedExpensesPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gastos Fijos</CardTitle>
                    <CardDescription>
                        Gestiona tus gastos recurrentes mensuales que no son deudas ni suscripciones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FixedExpensesWidget />
                </CardContent>
            </Card>
        </div>
    )
}

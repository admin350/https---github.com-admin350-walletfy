'use client';
import { FinancialCalendar } from "@/components/calendar/financial-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Calendario Financiero</CardTitle>
                    <CardDescription>
                        Una vista consolidada de todos tus próximos pagos, incluyendo deudas, suscripciones y gastos fijos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FinancialCalendar />
                </CardContent>
            </Card>
        </div>
    )
}

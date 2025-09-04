'use client';
import { FinancialCalendar } from "@/components/calendar/financial-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Calendario Financiero</h1>
                <p className="text-muted-foreground">
                    Una vista consolidada de todos tus próximos pagos, incluyendo deudas, suscripciones y gastos fijos.
                </p>
            </div>
            <FinancialCalendar />
        </div>
    )
}

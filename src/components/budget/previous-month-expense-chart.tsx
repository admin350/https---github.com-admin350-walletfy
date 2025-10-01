
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

export function PreviousMonthExpenseChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cierre Mes Anterior</CardTitle>
        <CardDescription>
            Resumen de gastos del mes anterior.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Gráfico temporalmente deshabilitado.</p>
      </CardContent>
    </Card>
  )
}

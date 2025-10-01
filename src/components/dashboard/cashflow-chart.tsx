
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

export function CashflowChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Flujo de Caja por Perfil</CardTitle>
                <CardDescription>
                    Balance neto (ingresos - egresos) de cada perfil a lo largo del período.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                 <p className="text-muted-foreground text-sm">Gráfico temporalmente deshabilitado.</p>
            </CardContent>
        </Card>
    );
}

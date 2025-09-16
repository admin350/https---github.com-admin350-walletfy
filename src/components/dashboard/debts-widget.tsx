
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { useData } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";

export function DebtsWidget() {
  const { debts, isLoading } = useData();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sortedDebts = debts.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Próximas Deudas</CardTitle>
        <CardDescription>Cuotas de deudas que vencen pronto.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading || !isClient ? (
           <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
                <li key={i} className="flex justify-between items-center h-[44px]">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </li>
            ))}
           </div>
        ) : sortedDebts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tienes deudas registradas.</p>
        ) : (
          <ul className="space-y-3">
            {sortedDebts.map((debt) => (
              <li key={debt.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{debt.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Vence: {format(debt.dueDate, "dd 'de' MMMM", { locale: es })}
                  </p>
                </div>
                <p className="font-semibold text-base">${debt.monthlyPayment.toLocaleString('es-CL')}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

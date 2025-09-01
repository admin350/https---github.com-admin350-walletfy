'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import type { UpcomingPayment } from '@/types';

const generateDebts = (): UpcomingPayment[] => [
  { id: '2', name: "Cuota Préstamo Auto", amount: 350000, dueDate: addDays(new Date(), 7) },
  { id: '3', name: "Alquiler", amount: 800000, dueDate: addDays(new Date(), 10) },
];


export function DebtsWidget() {
  const [debts, setDebts] = useState<UpcomingPayment[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setDebts(generateDebts());
    setIsClient(true);
  }, []);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Próximas Deudas</CardTitle>
        <CardDescription>Cuotas de deudas que vencen pronto.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {isClient ? debts.map((debt) => (
            <li key={debt.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{debt.name}</p>
                <p className="text-sm text-muted-foreground">
                  Vence: {format(debt.dueDate, "dd 'de' MMMM", { locale: es })}
                </p>
              </div>
              <p className="font-semibold text-base">${debt.amount.toLocaleString('es-CL')}</p>
            </li>
          )) : (
            Array.from({ length: 2 }).map((_, i) => (
              <li key={i} className="flex justify-between items-center h-[44px]">
                 <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-4 w-24 bg-muted rounded"></div>
                 </div>
                 <div className="h-6 w-16 bg-muted rounded"></div>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

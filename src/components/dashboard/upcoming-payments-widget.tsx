'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import type { UpcomingPayment } from '@/types';

const generateUpcomingPayments = (): UpcomingPayment[] => [
  { id: '1', name: "Suscripción Netflix", amount: 15.99, dueDate: addDays(new Date(), 3) },
  { id: '2', name: "Cuota Préstamo Auto", amount: 350, dueDate: addDays(new Date(), 7) },
  { id: '3', name: "Alquiler", amount: 800, dueDate: addDays(new Date(), 10) },
  { id: '4', name: "Spotify", amount: 9.99, dueDate: addDays(new Date(), 12) },
];


export function UpcomingPaymentsWidget() {
  const [payments, setPayments] = useState<UpcomingPayment[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setPayments(generateUpcomingPayments());
    setIsClient(true);
  }, []);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Próximos Pagos</CardTitle>
        <CardDescription>Suscripciones y cuotas que vencen pronto.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {isClient ? payments.map((payment) => (
            <li key={payment.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{payment.name}</p>
                <p className="text-sm text-muted-foreground">
                  Vence: {format(payment.dueDate, "dd 'de' MMMM", { locale: es })}
                </p>
              </div>
              <p className="font-semibold text-base">${payment.amount.toLocaleString('es-ES')}</p>
            </li>
          )) : (
            Array.from({ length: 4 }).map((_, i) => (
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

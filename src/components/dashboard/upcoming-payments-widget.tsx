'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import type { UpcomingPayment } from '@/types';

const generateUpcomingPayments = (): UpcomingPayment[] => [
  { id: '1', name: "Suscripción Netflix", amount: 15990, dueDate: addDays(new Date(), 3) },
  { id: '4', name: "Spotify", amount: 9990, dueDate: addDays(new Date(), 12) },
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
        <CardTitle>Próximas Suscripciones</CardTitle>
        <CardDescription>Suscripciones que vencen pronto.</CardDescription>
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
              <p className="font-semibold text-base">${payment.amount.toLocaleString('es-CL')}</p>
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


'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect, useContext } from 'react';
import { DataContext } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function OverdueDebtsWidget() {
  const { debts, isLoading } = useContext(DataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const overdueDebts = debts.filter(d => isPast(d.dueDate) && d.paidAmount < d.totalAmount);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            Deudas Atrasadas
        </CardTitle>
        <CardDescription>Pagos de deudas que han vencido.</CardDescription>
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
        ) : overdueDebts.length === 0 ? (
          <p className="text-muted-foreground text-sm">¡Excelente! No tienes deudas atrasadas.</p>
        ) : (
          <ul className="space-y-3">
            {overdueDebts.map((debt) => (
              <li key={debt.id} className="flex justify-between items-center">
                <div>
                   <Link href={`/dashboard/debts/${debt.id}`} className="font-medium text-primary hover:underline">
                        {debt.name}
                    </Link>
                  <p className="text-sm text-muted-foreground">
                    Venció: {format(debt.dueDate, "dd 'de' MMMM", { locale: es })}
                  </p>
                </div>
                <p className="font-semibold text-base text-red-500">${debt.monthlyPayment.toLocaleString('es-CL')}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}


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

  if (isLoading || !isClient || overdueDebts.length === 0) {
    return null; // Don't render anything if there are no overdue debts or if still loading
  }

  return (
    <Card className="bg-red-900/20 border-red-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle />
            Deudas Atrasadas
        </CardTitle>
        <CardDescription className="text-red-400/80">Tienes pagos de deudas que han vencido. ¡Revísalos!</CardDescription>
      </CardHeader>
      <CardContent>
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
                <p className="font-semibold text-base text-red-400">${debt.monthlyPayment.toLocaleString('es-CL')}</p>
              </li>
            ))}
          </ul>
      </CardContent>
    </Card>
  );
}

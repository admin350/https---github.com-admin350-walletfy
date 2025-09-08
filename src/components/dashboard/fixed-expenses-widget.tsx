
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from 'react';
import { useData } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";

export function FixedExpensesWidget() {
  const { fixedExpenses, isLoading, formatCurrency } = useData();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Gastos Fijos Mensuales</CardTitle>
        <CardDescription>Gastos que se repiten cada mes.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !isClient ? (
           <div className="space-y-3">
             {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex justify-between items-center h-[44px]">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                 </div>
                 <Skeleton className="h-6 w-16" />
              </li>
            ))}
           </div>
        ) : fixedExpenses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tienes gastos fijos registrados.</p>
        ): (
        <ul className="space-y-3">
          {fixedExpenses.map((expense) => (
            <li key={expense.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{expense.name}</p>
                <p className="text-sm text-muted-foreground">{expense.category}</p>
              </div>
              <p className="font-semibold text-base">{formatCurrency(expense.amount)}</p>
            </li>
          ))}
        </ul>
        )}
      </CardContent>
    </Card>
  );
}

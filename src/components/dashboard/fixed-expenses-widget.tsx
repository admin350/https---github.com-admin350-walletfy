'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from 'react';

type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  category: string;
};

const generateFixedExpenses = (): FixedExpense[] => [
  { id: '1', name: "Gimnasio", amount: 50, category: "Salud" },
  { id: '2', name: "Plan Celular", amount: 45, category: "Servicios" },
  { id: '3', name: "Internet", amount: 60, category: "Servicios" },
];

export function FixedExpensesWidget() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setExpenses(generateFixedExpenses());
    setIsClient(true);
  }, []);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Gastos Fijos Mensuales</CardTitle>
        <CardDescription>Gastos que se repiten cada mes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {isClient ? expenses.map((expense) => (
            <li key={expense.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{expense.name}</p>
                <p className="text-sm text-muted-foreground">{expense.category}</p>
              </div>
              <p className="font-semibold text-base">${expense.amount.toLocaleString('es-ES')}</p>
            </li>
          )) : (
            Array.from({ length: 3 }).map((_, i) => (
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

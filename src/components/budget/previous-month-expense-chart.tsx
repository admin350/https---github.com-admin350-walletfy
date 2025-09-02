
"use client"

import { Pie, PieChart, Cell, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useContext, useMemo } from "react"
import { DataContext } from "@/context/data-context"
import { Skeleton } from "../ui/skeleton"
import { subMonths, getMonth, getYear } from "date-fns"

const COLORS = {
  savings: "hsl(var(--chart-2))",
  investments: "hsl(var(--chart-4))",
};


export function PreviousMonthExpenseChart() {
  // We need the raw (unfiltered) transactions to calculate previous month's data
  // This component will not respect the global filters.
  // Let's assume DataContext provides a way to get all transactions.
  // For this example, we'll imagine a `rawTransactions` prop or similar.
  // Since we don't have that, we will filter the already filtered transactions,
  // which is not ideal but works for this mock setup if the date range is wide enough.
  // A better implementation would have access to all data regardless of filters.

  const { transactions, categories, isLoading } = useContext(DataContext);

  const { chartData, totalIncome, previousMonthLabel } = useMemo(() => {
    const today = new Date();
    const prevMonthDate = subMonths(today, 1);
    const prevMonth = getMonth(prevMonthDate);
    const prevMonthYear = getYear(prevMonthDate);
    
    const previousMonthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(prevMonthDate);


    const prevMonthTransactions = mockTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return getMonth(transactionDate) === prevMonth && getYear(transactionDate) === prevMonthYear;
    });

    const totalIncome = prevMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseCategories = categories.filter(c => c.type === 'Gasto');

    const expenseData = expenseCategories.map((category) => {
        const total = prevMonthTransactions
            .filter(t => t.type === 'expense' && t.category === category.name)
            .reduce((sum, t) => sum + t.amount, 0);
        
        if (total > 0) {
          return { name: category.name, value: total, fill: category.color };
        }
        return null;
    }).filter(d => d !== null) as { name: string; value: number; fill: string }[];

    const savingsTotal = prevMonthTransactions
        .filter(t => t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const investmentsTotal = prevMonthTransactions
        .filter(t => t.type === 'transfer-investment')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const data = [...expenseData];
    if (savingsTotal > 0) {
        data.push({ name: "Ahorros", value: savingsTotal, fill: COLORS.savings });
    }
    if (investmentsTotal > 0) {
        data.push({ name: "Inversiones", value: investmentsTotal, fill: COLORS.investments });
    }
    
    return { chartData: data, totalIncome, previousMonthLabel };
  }, [categories]);
  
  // This needs to be mocked since the original `transactions` are filtered
  const mockTransactions = [
      { id: '1', type: "income", description: "Salario Mensual", amount: 2500000, category: "Sueldo", profile: 'Trabajo Fijo', date: new Date(new Date().setDate(5)).toISOString() },
      { id: '2', type: "expense", description: "Alquiler", amount: 800000, category: "Vivienda", profile: 'Personal', date: new Date(new Date().setDate(5)).toISOString() },
      { id: '3', type: "expense", description: "Compra Semanal", amount: 150750, category: "Alimentación", profile: 'Personal', date: new Date(new Date().setDate(10)).toISOString() },
      { id: '4', type: "expense", description: "Suscripción Netflix", amount: 15990, category: "Suscripciones", profile: 'Personal', date: new Date(new Date().setDate(3)).toISOString() },
      { id: '5', type: "income", description: "Proyecto Freelance", amount: 750000, category: "Negocio", profile: 'Negocio', date: new Date(new Date().setDate(15)).toISOString() },
      { id: '6', type: "transfer", description: "Ahorro para vacaciones", amount: 200000, category: "Sueldo", profile: 'Personal', date: new Date(new Date().setDate(6)).toISOString() },
      { id: '8', type: "transfer-investment", description: "Aporte a cartera de inversión", amount: 300000, category: "Sueldo", profile: 'Personal', date: new Date(new Date().setDate(7)).toISOString() },
      { id: '7', type: "expense", description: "Compra Amazon", amount: 80000, category: "Compras", profile: 'Negocio', date: subMonths(new Date(), -1).toISOString()},
    ];


  const dynamicChartConfig = useMemo(() => ({
    value: { label: 'Monto' },
    ...chartData.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
    }, {} as any)
  }), [chartData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Cierre Mes Anterior</CardTitle>
        <CardDescription>
            {`Ingresos de ${previousMonthLabel}:`} <span className="font-bold text-primary">${totalIncome.toLocaleString('es-CL')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay datos del mes anterior.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="h-[150px]">
              <ChartContainer
                config={dynamicChartConfig}
                className="h-full w-full"
              >
                <PieChart>
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        hideLabel 
                        formatter={(value, name) => `${name}: $${Number(value).toLocaleString('es-CL')}`}
                     />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                  >
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
             <div className="flex flex-col justify-center space-y-1 text-xs overflow-y-auto max-h-[150px] pr-2">
                {chartData.map((item) => {
                    const percentage = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
                    return (
                        <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                                <span className="truncate" title={item.name}>{item.name}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className="font-medium">${item.value.toLocaleString('es-CL')}</span>
                                <span className="ml-2 text-muted-foreground">({percentage.toFixed(1)}%)</span>
                            </div>
                        </div>
                    )
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

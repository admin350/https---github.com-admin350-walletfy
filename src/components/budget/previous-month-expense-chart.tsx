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
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react"
import { useData } from "@/context/data-context"
import { Skeleton } from "../ui/skeleton"
import { subMonths, getMonth, getYear } from "date-fns"
import type { Transaction } from "@/types";

const COLORS = {
  transfer: "hsl(var(--chart-5))",
};

export function PreviousMonthExpenseChart() {
  const { categories, isLoading, getAllDataForMonth, formatCurrency } = useData();

  const { chartData, totalIncome, previousMonthLabel } = useMemo(() => {
    const today = new Date();
    const prevMonthDate = subMonths(today, 1);
    const prevMonth = getMonth(prevMonthDate);
    const prevMonthYear = getYear(prevMonthDate);
    
    const previousMonthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(prevMonthDate);

    // Use the unfiltered data getter
    const { transactions: prevMonthTransactions } = getAllDataForMonth(prevMonth, prevMonthYear);

    const totalIncome = prevMonthTransactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const expenseCategories = categories.filter(c => c.type === 'Gasto');

    const expenseData = expenseCategories.map((category) => {
        const total = prevMonthTransactions
            .filter((t: Transaction) => t.type === 'expense' && t.category === category.name)
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
        if (total > 0) {
          return { name: category.name, value: total, fill: category.color };
        }
        return null;
    }).filter(d => d !== null) as { name: string; value: number; fill: string }[];

    const transferTotal = prevMonthTransactions
        .filter((t: Transaction) => t.type === 'transfer')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
    const data = [...expenseData];
    if (transferTotal > 0) {
        data.push({ name: "Transferencias", value: transferTotal, fill: COLORS.transfer });
    }
    
    return { chartData: data, totalIncome, previousMonthLabel };
  }, [categories, getAllDataForMonth]);

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
            {`Ingresos de ${previousMonthLabel}:`} <span className="font-bold text-primary">{formatCurrency(totalIncome)}</span>
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
                        formatter={(value, name) => `${name}: ${formatCurrency(Number(value))}`}
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
                                <span className="font-medium">{formatCurrency(item.value)}</span>
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

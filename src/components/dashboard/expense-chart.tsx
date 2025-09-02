
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

const COLORS = {
  savings: "hsl(var(--chart-2))",
  investments: "hsl(var(--chart-4))",
};


export function ExpenseChart() {
  const { transactions, categories, isLoading } = useContext(DataContext);
  
  const { chartData, totalIncome } = useMemo(() => {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseCategories = categories.filter(c => c.type === 'Gasto');

    const expenseData = expenseCategories.map((category) => {
        const total = transactions
            .filter(t => t.type === 'expense' && t.category === category.name)
            .reduce((sum, t) => sum + t.amount, 0);
        
        if (total > 0) {
          return { name: category.name, value: total, fill: category.color };
        }
        return null;
    }).filter(d => d !== null) as { name: string; value: number; fill: string }[];

    const savingsTotal = transactions
        .filter(t => t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const investmentsTotal = transactions
        .filter(t => t.type === 'transfer-investment')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const data = [...expenseData];
    if (savingsTotal > 0) {
        data.push({ name: "Ahorros", value: savingsTotal, fill: COLORS.savings });
    }
    if (investmentsTotal > 0) {
        data.push({ name: "Inversiones", value: investmentsTotal, fill: COLORS.investments });
    }
    
    return { chartData: data, totalIncome };
  }, [transactions, categories]);

  const dynamicChartConfig = useMemo(() => ({
    value: { label: 'Monto' },
    ...chartData.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
    }, {} as any)
  }), [chartData]);


  return (
    <div className="flex flex-col h-full">
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay datos para mostrar.</p>
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
    </div>
  )
}


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

const chartConfig = {
  amount: {
    label: "Monto",
  },
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(20, 80%, 50%)",
  "hsl(260, 80%, 60%)",
];

export function ExpenseChart() {
  const { transactions, categories, isLoading } = useContext(DataContext);
  
  const chartData = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'Gasto').map(c => c.name);
    const data = expenseCategories.map((category, index) => {
      const total = transactions
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category,
        amount: total,
        fill: COLORS[index % COLORS.length]
      }
    }).filter(d => d.amount > 0);

    return data;
  }, [transactions, categories]);

  const dynamicChartConfig = useMemo(() => ({
    amount: { label: 'Monto' },
    ...chartData.reduce((acc, item) => {
        acc[item.category] = { label: item.category, color: item.fill };
        return acc;
    }, {} as any)
  }), [chartData]);


  return (
    <Card className="flex flex-col h-full bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Distribución de Egresos</CardTitle>
        <CardDescription>Distribución de gastos reales por categoría en el período</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay datos de gastos para mostrar.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="h-[200px]">
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
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
             <div className="flex flex-col justify-center space-y-2">
                {chartData.map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span>{item.category}</span>
                        </div>
                        <span className="font-medium">${item.amount.toLocaleString('es-CL')}</span>
                    </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

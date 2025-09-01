
"use client"

import { Pie, PieChart, Cell } from "recharts"
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
        <CardDescription>Distribución de gastos por categoría este mes</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="aspect-square w-full max-w-[300px] rounded-full" />
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay datos de gastos para mostrar.</p>
        ) : (
          <ChartContainer
            config={dynamicChartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
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
                innerRadius="60%"
                strokeWidth={5}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
       <CardContent className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span>{item.category}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

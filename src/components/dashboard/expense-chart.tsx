

"use client"

import { Pie, PieChart, Cell, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react"
import { useData } from "@/context/data-context"
import { Skeleton } from "../ui/skeleton"

export function ExpenseChart() {
  const { transactions, categories, isLoading, formatCurrency } = useData();
  
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

    const data = [...expenseData];
    
    return { chartData: data, totalIncome };
  }, [transactions, categories]);

  const dynamicChartConfig = useMemo(() => ({
    value: { label: 'Monto' },
    ...chartData.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
    }, {} as any)
  }), [chartData]);


  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }
  
  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-[150px]">
             <p className="text-muted-foreground text-sm">No hay datos para mostrar.</p>
        </div>
    );
  }

  return (
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
  )
}

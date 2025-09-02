
"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { format, eachDayOfInterval, startOfMonth, endOfMonth, parseISO, getYear, getMonth, lastDayOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Skeleton } from "../ui/skeleton"

const chartConfig = {
  income: {
    label: "Ingresos",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Egresos",
    color: "hsl(var(--chart-5))",
  },
}

export function CashflowChart() {
  const { transactions, isLoading, filters } = useContext(DataContext);

  const chartData = useMemo(() => {
    if (filters.month === -1) return []; // Don't show month-based chart for "All Year" view

    const date = new Date(filters.year, filters.month);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;

    return daysInMonth.map(day => {
      const dailyIncome = transactions
        .filter(t => t.type === 'income' && format(parseISO(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dailyExpenses = transactions
        .filter(t => t.type === 'expense' && format(parseISO(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((sum, t) => sum + t.amount, 0);

      cumulativeIncome += dailyIncome;
      cumulativeExpenses += dailyExpenses;
      
      return {
        day: format(day, 'dd'),
        income: cumulativeIncome,
        expenses: cumulativeExpenses,
      };
    });
  }, [transactions, filters]);


  const yearlyChartData = useMemo(() => {
    if (filters.month !== -1) return []; // Only for "All Year" view

    const months = Array.from({ length: 12 }, (_, i) => i);
    
    return months.map(month => {
        const monthlyIncome = transactions
            .filter(t => t.type === 'income' && getMonth(parseISO(t.date)) === month && getYear(parseISO(t.date)) === filters.year)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const monthlyExpenses = transactions
            .filter(t => t.type === 'expense' && getMonth(parseISO(t.date)) === month && getYear(parseISO(t.date)) === filters.year)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            month: format(new Date(filters.year, month), 'LLL', { locale: es }),
            income: monthlyIncome,
            expenses: monthlyExpenses,
        };
    });
  }, [transactions, filters]);
  
  const isYearlyView = filters.month === -1;
  const currentChartData = isYearlyView ? yearlyChartData : chartData;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Flujo de Caja del Período</CardTitle>
        <CardDescription>
          {isYearlyView ? 'Ingresos vs. egresos a lo largo del año' : 'Ingresos acumulados vs. egresos acumulados a lo largo del mes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              accessibilityLayer
              data={currentChartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={isYearlyView ? "month" : "day"}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${Number(value).toLocaleString('es-CL')}`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value, name) => `${(name as string).charAt(0).toUpperCase() + (name as string).slice(1)}: $${Number(value).toLocaleString('es-CL')}`} />} />
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="income"
                type="natural"
                fill="url(#fillIncome)"
                fillOpacity={0.4}
                stroke="var(--color-income)"
                stackId="a"
              />
              <Area
                dataKey="expenses"
                type="natural"
                fill="url(#fillExpenses)"
                fillOpacity={0.4}
                stroke="var(--color-expenses)"
                stackId="b"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

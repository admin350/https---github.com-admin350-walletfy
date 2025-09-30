
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
import { useMemo } from "react"
import { useData } from "@/context/data-context"
import { format, eachDayOfInterval, startOfMonth, endOfMonth, parseISO, getYear, getMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Skeleton } from "../ui/skeleton"
import type { Transaction, Profile } from "@/types"

export function CashflowChart() {
  const { transactions, isLoading, profiles, formatCurrency, filters } = useData();
  
  const chartConfig = useMemo(() => {
    const config: any = {};
    profiles.forEach((p: Profile) => {
        config[`income-${p.id}`] = { label: `Ingreso (${p.name})`, color: p.color };
        config[`expenses-${p.id}`] = { label: `Egreso (${p.name})`, color: p.color };
    });
    return config;
  }, [profiles]);
  
  const yearlyChartData = useMemo(() => {
    if (filters.month !== -1) return []; // Only for "All Year" view

    const months = Array.from({ length: 12 }, (_, i) => i);
    
    return months.map(month => {
      const dataPoint: { [key: string]: any } = {
        month: format(new Date(filters.year, month), 'LLL', { locale: es }),
      };

      profiles.forEach((profile: Profile) => {
        const incomeKey = `income-${profile.id}`;
        const expenseKey = `expenses-${profile.id}`;
        
        dataPoint[incomeKey] = transactions
          .filter((t: Transaction) => t.type === 'income' && getMonth(new Date(t.date)) === month && getYear(new Date(t.date)) === filters.year && t.profile === profile.name)
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        dataPoint[expenseKey] = transactions
          .filter((t: Transaction) => t.type === 'expense' && getMonth(new Date(t.date)) === month && getYear(new Date(t.date)) === filters.year && t.profile === profile.name)
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      });
      
      return dataPoint;
    });
  }, [transactions, filters, profiles]);


  const monthlyChartData = useMemo(() => {
    if (filters.month === -1) return []; // Don't show month-based chart for "All Year" view

    const date = new Date(filters.year, filters.month);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const cumulativeTotals: { [key: string]: number } = {};

    return daysInMonth.map(day => {
       const dataPoint: { [key: string]: any } = {
        day: format(day, 'dd'),
      };
      
      profiles.forEach((profile: Profile) => {
          const incomeKey = `income-${profile.id}`;
          const expenseKey = `expenses-${profile.id}`;

          if (!cumulativeTotals[incomeKey]) cumulativeTotals[incomeKey] = 0;
          if (!cumulativeTotals[expenseKey]) cumulativeTotals[expenseKey] = 0;

          const dailyIncome = transactions
            .filter((t: Transaction) => t.type === 'income' && format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && t.profile === profile.name)
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
          const dailyExpenses = transactions
            .filter((t: Transaction) => t.type === 'expense' && format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && t.profile === profile.name)
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

           cumulativeTotals[incomeKey] += dailyIncome;
           cumulativeTotals[expenseKey] += dailyExpenses;
           
           dataPoint[incomeKey] = cumulativeTotals[incomeKey];
           dataPoint[expenseKey] = cumulativeTotals[expenseKey];
      });

      return dataPoint;
    });
  }, [transactions, filters, profiles]);


  const isYearlyView = filters.month === -1;
  const currentChartData = isYearlyView ? yearlyChartData : monthlyChartData;

  const incomeKeys = profiles.map((p: Profile) => `income-${p.id}`);
  const expenseKeys = profiles.map((p: Profile) => `expenses-${p.id}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flujo de Caja por Perfil</CardTitle>
        <CardDescription>
           {isYearlyView ? 'Ingresos vs. egresos por perfil a lo largo del año' : 'Acumulado de ingresos vs. egresos por perfil a lo largo del mes'}
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
                  tickFormatter={(value) => formatCurrency(Number(value), false, true)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value, name, item) => {
                  const configKey = item.dataKey;
                  if (!configKey) return null;
                  const itemConfig = chartConfig[configKey];
                  if (!itemConfig) return null;
                  return (
                     <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: itemConfig.color }} />
                        <div className="flex-1">
                          <span>{itemConfig.label}:</span>
                          <span className="font-bold ml-2">{formatCurrency(Number(value))}</span>
                        </div>
                     </div>
                  )
              }} />} />
              {incomeKeys.map((key) => (
                  <Area
                    key={key}
                    dataKey={key}
                    type="natural"
                    fill={chartConfig[key]?.color}
                    fillOpacity={0.4}
                    stroke={chartConfig[key]?.color}
                    stackId="income"
                  />
              ))}
               {expenseKeys.map((key) => (
                  <Area
                    key={key}
                    dataKey={key}
                    type="natural"
                    fill={chartConfig[key]?.color}
                    fillOpacity={0.4}
                    stroke={chartConfig[key]?.color}
                    stackId="expense"
                  />
              ))}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

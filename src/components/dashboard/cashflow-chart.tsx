
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts"

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
import { format, eachDayOfInterval, startOfMonth, endOfMonth, getYear, getMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Skeleton } from "../ui/skeleton"
import type { Transaction, Profile } from "@/types"

export function CashflowChart() {
  const { transactions, isLoading, profiles, formatCurrency, filters } = useData();
  
  const chartConfig = useMemo(() => {
    const config: any = {};
    profiles.forEach((p: Profile) => {
        config[p.name] = { label: p.name, color: p.color };
    });
    return config;
  }, [profiles]);
  
  const chartData = useMemo(() => {
    const isYearlyView = filters.month === -1;
    
    if (isYearlyView) {
      const months = Array.from({ length: 12 }, (_, i) => i);
      return months.map(month => {
        const dataPoint: { [key: string]: any } = {
          date: format(new Date(filters.year, month), 'LLL', { locale: es }),
        };
        
        let totalNet = 0;
        profiles.forEach((profile: Profile) => {
          const income = transactions
            .filter((t: Transaction) => t.type === 'income' && getMonth(new Date(t.date)) === month && getYear(new Date(t.date)) === filters.year && t.profile === profile.name)
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

          const expense = transactions
            .filter((t: Transaction) => t.type === 'expense' && getMonth(new Date(t.date)) === month && getYear(new Date(t.date)) === filters.year && t.profile === profile.name)
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
          
          const net = income - expense;
          dataPoint[profile.name] = net;
          totalNet += net;
        });
        dataPoint.total = totalNet;
        return dataPoint;
      });
    } else {
      const date = new Date(filters.year, filters.month);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      return daysInMonth.map(day => {
        const dataPoint: { [key: string]: any } = {
          date: format(day, 'dd'),
        };

        let totalNet = 0;
        profiles.forEach((profile: Profile) => {
            const dailyIncome = transactions
              .filter((t: Transaction) => t.type === 'income' && format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && t.profile === profile.name)
              .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
          
            const dailyExpenses = transactions
              .filter((t: Transaction) => t.type === 'expense' && format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && t.profile === profile.name)
              .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            const net = dailyIncome - dailyExpenses;
            dataPoint[profile.name] = net;
            totalNet += net;
        });
        dataPoint.total = totalNet;
        return dataPoint;
      });
    }
  }, [transactions, filters, profiles]);

  const isYearlyView = filters.month === -1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flujo de Caja por Perfil</CardTitle>
        <CardDescription>
           Balance neto (ingresos - egresos) de cada perfil a lo largo del período.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => formatCurrency(Number(value), false, true)}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartConfig[name as string]?.color }} />
                           <div className="flex-1">
                              <span>{name}:</span>
                              <span className={`font-bold ml-2 ${Number(value) < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(Number(value))}</span>
                            </div>
                        </div>
                      )}
                       labelFormatter={(label, payload) => {
                         const total = payload.reduce((acc, item) => acc + (item.value as number), 0);
                         return (
                          <div>
                            <p>Fecha: {label}</p>
                            <p className="font-bold">Total Neto: {formatCurrency(total)}</p>
                          </div>
                         )
                       }}
                    />
                  }
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                {profiles.map((profile) => (
                    <Bar key={profile.name} dataKey={profile.name} fill={profile.color} stackId="a" />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

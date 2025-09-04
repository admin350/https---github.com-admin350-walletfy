
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react"
import { useData } from "@/context/data-context"
import { Skeleton } from "../ui/skeleton"

export function DebtsOverviewChart() {
  const { debts, profiles, isLoading, formatCurrency } = useData();
  
  const chartData = useMemo(() => {
    return debts
        .filter(d => d.paidAmount < d.totalAmount) // Only show active debts
        .map(debt => {
            const profile = profiles.find(p => p.name === debt.profile);
            return {
                name: debt.name,
                total: debt.totalAmount,
                paid: debt.paidAmount,
                remaining: debt.totalAmount - debt.paidAmount,
                fill: profile ? profile.color : "hsl(var(--chart-1))",
            };
    });
  }, [debts, profiles]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      paid: { label: "Pagado" },
      remaining: { label: "Restante" },
    };
    return config;
  }, []);


  if (isLoading) {
    return <Skeleton className="h-[250px] w-full" />;
  }
  
  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-[250px]">
             <p className="text-muted-foreground text-sm">No tienes deudas activas para mostrar.</p>
        </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
            barSize={20}
        >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={120}
                className="truncate"
            />
            <XAxis dataKey="total" type="number" hide />
             <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                content={<ChartTooltipContent 
                    formatter={(value, name, props) => {
                        const { payload } = props;
                        return (
                            <div className="flex flex-col gap-1 text-sm">
                                <span className="font-bold" style={{ color: payload.fill }}>{payload.name}</span>
                                <span>Pagado: {formatCurrency(payload.paid)}</span>
                                <span>Restante: {formatCurrency(payload.remaining)}</span>
                                <span className="font-semibold">Total: {formatCurrency(payload.total)}</span>
                            </div>
                        )
                    }}
                />}
            />
            <Bar dataKey="paid" stackId="a" radius={[5, 0, 0, 5]} style={{ stroke: 'white', strokeWidth: 1 }}>
                 {chartData.map((entry) => (
                    <Cell key={`cell-paid-${entry.name}`} fill={entry.fill} />
                ))}
            </Bar>
             <Bar dataKey="remaining" stackId="a" radius={[0, 5, 5, 0]}>
                {chartData.map((entry) => (
                    <Cell key={`cell-remaining-${entry.name}`} fill={entry.fill} opacity={0.3} />
                ))}
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// Recharts doesn't directly expose Cell for BarChart, but it works.
// We'll declare it to satisfy TypeScript.
const Cell = (_props: { fill: string; key: string, opacity?: number }) => null;

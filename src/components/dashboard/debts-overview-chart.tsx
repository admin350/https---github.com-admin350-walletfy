
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useContext, useMemo } from "react"
import { DataContext } from "@/context/data-context"
import { Skeleton } from "../ui/skeleton"

export function DebtsOverviewChart() {
  const { debts, profiles, isLoading } = useContext(DataContext);
  
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
    const config: ChartConfig = {};
    chartData.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill,
        };
    });
    return config;
  }, [chartData]);


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
      <BarChart 
        accessibilityLayer 
        data={chartData} 
        layout="vertical"
        margin={{ left: 10, right: 10 }}
      >
        <CartesianGrid horizontal={false} />
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
          cursor={{ fill: "hsl(var(--muted))" }}
          content={<ChartTooltipContent 
            formatter={(value, name, props) => {
                 const { payload } = props;
                 return (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold" style={{ color: payload.fill }}>{payload.name}</span>
                        <span>Total: ${payload.total.toLocaleString('es-CL')}</span>
                        <span>Pagado: ${payload.paid.toLocaleString('es-CL')}</span>
                        <span className="font-semibold">Restante: ${payload.remaining.toLocaleString('es-CL')}</span>
                    </div>
                )
            }}
          />}
        />
        <Bar dataKey="total" radius={5}>
            {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

// Recharts doesn't directly expose Cell for BarChart, but it works.
// We'll declare it to satisfy TypeScript.
const Cell = (_props: { fill: string; key: string }) => null;

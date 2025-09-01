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

const chartData = [
  { day: "01", income: 0, expenses: 0 },
  { day: "05", income: 2500000, expenses: 500000 },
  { day: "10", income: 2500000, expenses: 1100000 },
  { day: "15", income: 5000000, expenses: 1800000 },
  { day: "20", income: 5000000, expenses: 2200000 },
  { day: "25", income: 5000000, expenses: 2500000 },
  { day: "30", income: 5000000, expenses: 2750000 },
]

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
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Flujo de Caja Mensual</CardTitle>
        <CardDescription>
          Ingresos acumulados vs. egresos acumulados a lo largo del mes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `$${Number(value).toLocaleString('es-CL')}`} />} />
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
              stroke="var(--color-income)"
              stackId="a"
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke="var(--color-expenses)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

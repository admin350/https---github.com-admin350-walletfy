
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

const chartData = [
  { category: "Vivienda", amount: 800000, fill: "var(--chart-1)" },
  { category: "Transporte", amount: 400000, fill: "var(--chart-2)" },
  { category: "Comida", amount: 600000, fill: "var(--chart-3)" },
  { category: "Ocio", amount: 350000, fill: "var(--chart-4)" },
  { category: "Otros", amount: 600000, fill: "var(--chart-5)" },
]

const chartConfig = {
  amount: {
    label: "Monto",
  },
  Vivienda: { label: 'Vivienda', color: 'hsl(var(--chart-1))' },
  Transporte: { label: 'Transporte', color: 'hsl(var(--chart-2))' },
  Comida: { label: 'Comida', color: 'hsl(var(--chart-3))' },
  Ocio: { label: 'Ocio', color: 'hsl(var(--chart-4))' },
  Otros: { label: 'Otros', color: 'hsl(var(--chart-5))' },
}

export function ExpenseChart() {
  const totalAmount = chartData.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <Card className="flex flex-col h-full bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Distribución de Egresos</CardTitle>
        <CardDescription>Porcentaje del ingreso total por categoría</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => `$${Number(value).toLocaleString('es-CL')}`} />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius="60%"
              strokeWidth={5}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
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


'use client';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { useData } from '@/context/data-context';
import { subMonths, getMonth, getYear } from 'date-fns';
import type { Transaction } from '@/types';

export function PreviousMonthExpenseChart() {
    const { transactions, categories, isLoading, formatCurrency } = useData();

    const previousMonthData = useMemo(() => {
        const today = new Date();
        const prevMonthDate = subMonths(today, 1);
        const prevMonth = getMonth(prevMonthDate);
        const prevYear = getYear(prevMonthDate);

        const expenseTransactions = transactions.filter((t: Transaction) => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && getMonth(tDate) === prevMonth && getYear(tDate) === prevYear;
        });

        const expensesByCategory = expenseTransactions.reduce((acc: Record<string, number>, t: Transaction) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

        return Object.entries(expensesByCategory).map(([name, value]) => ({
            name,
            value,
            fill: categories.find(c => c.name === name)?.color || '#8884d8'
        }));
    }, [transactions, categories]);

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="h-[250px]">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        )
    }

    if (previousMonthData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cierre Mes Anterior</CardTitle>
                    <CardDescription>Resumen de gastos del mes anterior.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No hay gastos para mostrar del mes anterior.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cierre Mes Anterior</CardTitle>
                <CardDescription>Resumen de gastos del mes anterior.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Pie
                            data={previousMonthData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            dataKey="value"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                        >
                            {previousMonthData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                         <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

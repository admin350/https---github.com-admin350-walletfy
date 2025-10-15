'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '@/context/data-context';
import { Skeleton } from '../ui/skeleton';
import type { Transaction } from '@/types';

export function ExpenseChart() {
    const { transactions, categories, isLoading, formatCurrency } = useData();

    const expenseData = useMemo(() => {
        const expenseTransactions = transactions.filter((t: Transaction) => t.type === 'expense');
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
        return <Skeleton className="h-[250px] w-full" />;
    }
    
    if (expenseData.length === 0) {
        return (
            <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No hay gastos para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="h-[250px]">
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
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                    >
                        {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

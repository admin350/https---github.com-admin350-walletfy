
'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '@/context/data-context';
import { Skeleton } from '../ui/skeleton';
import type { Debt } from '@/types';

export function DebtsOverviewChart() {
    const { debts, isLoading, formatCurrency, profiles } = useData();

    const chartData = useMemo(() => {
        return profiles.map(profile => {
            const profileDebts = debts.filter((d: Debt) => d.profile === profile.name && d.paidAmount < d.totalAmount);
            const remainingDebt = profileDebts.reduce((acc, debt) => acc + (debt.totalAmount - debt.paidAmount), 0);
            return {
                name: profile.name,
                remainingDebt: remainingDebt,
                fill: profile.color,
            };
        }).filter(p => p.remainingDebt > 0);
    }, [debts, profiles]);

    if (isLoading) {
        return <Skeleton className="h-[250px] w-full" />;
    }

    if (chartData.length === 0) {
        return (
            <div className="h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No tienes deudas activas.</p>
            </div>
        );
    }

    return (
        <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip 
                         contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="remainingDebt" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

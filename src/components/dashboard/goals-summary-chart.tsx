
'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '@/context/data-context';
import { Skeleton } from '../ui/skeleton';
import type { SavingsGoal } from '@/types';

export function GoalsSummaryChart() {
    const { goals, isLoading, formatCurrency, profiles } = useData();

    const chartData = useMemo(() => {
        return profiles.map(profile => {
            const profileGoals = goals.filter((g: SavingsGoal) => g.profile === profile.name && g.currentAmount < g.targetAmount);
            const totalSaved = profileGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);
            return {
                name: profile.name,
                totalSaved: totalSaved,
                fill: profile.color,
            };
        }).filter(p => p.totalSaved > 0);
    }, [goals, profiles]);

    if (isLoading) {
        return <Skeleton className="h-[250px] w-full" />;
    }

    if (chartData.length === 0) {
        return (
            <div className="h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No tienes progreso en tus metas.</p>
            </div>
        );
    }

    return (
        <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/>
                    <Tooltip 
                         contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="totalSaved" radius={[0, 4, 4, 0]}>
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

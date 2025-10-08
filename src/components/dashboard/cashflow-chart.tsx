
'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '@/context/data-context';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import type { Transaction } from '@/types';

export function CashflowChart() {
    const { transactions, profiles, isLoading, formatCurrency } = useData();

    const chartData = useMemo(() => {
        return profiles.map(profile => {
            const profileTransactions = transactions.filter((t: Transaction) => t.profile === profile.name);
            const income = profileTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expense = profileTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            return {
                name: profile.name,
                Ingresos: income,
                Egresos: expense,
            };
        });
    }, [transactions, profiles]);

    if (isLoading) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Flujo de Caja por Perfil</CardTitle>
                    <CardDescription>Ingresos vs. Egresos de cada perfil.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        );
    }
    
    if (chartData.every(d => d.Ingresos === 0 && d.Egresos === 0)) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Flujo de Caja por Perfil</CardTitle>
                    <CardDescription>Ingresos vs. Egresos de cada perfil.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No hay datos de flujo de caja para mostrar.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Flujo de Caja por Perfil</CardTitle>
                <CardDescription>
                    Comparación de Ingresos vs. Egresos para cada perfil en el período.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/>
                        <YAxis tickFormatter={(value) => formatCurrency(value, false, true)} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/>
                        <Tooltip 
                            contentStyle={{
                                background: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                        <Bar dataKey="Ingresos" fill="#22c55e" name="Ingresos" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Egresos" fill="#ef4444" name="Egresos" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

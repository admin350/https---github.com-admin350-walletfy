'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '@/context/data-context';
import { Skeleton } from '../ui/skeleton';
import type { Transaction } from '@/types';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 5) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const CustomLegend = (props: any) => {
    const { payload } = props;
    const { formatCurrency } = useData();
    
    if (!payload || payload.length === 0) return null;

    const total = payload.reduce((sum: number, entry: any) => sum + entry.payload.value, 0);
    const sortedPayload = [...payload].sort((a, b) => b.payload.value - a.payload.value);

    return (
        <div className="flex flex-col justify-center h-full space-y-3 text-sm overflow-y-auto">
            {sortedPayload.map((entry: any, index: number) => {
                 const percentage = (entry.payload.value / total) * 100;
                 return (
                    <div key={`item-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center truncate">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                            <div className="flex flex-col">
                                <span className="text-foreground text-xs truncate" title={entry.value}>{entry.value}</span>
                                <span className="text-muted-foreground text-xs">{formatCurrency(entry.payload.value)}</span>
                            </div>
                        </div>
                        <span className="font-mono font-medium text-xs ml-2">{percentage.toFixed(1)}%</span>
                    </div>
                )
            })}
        </div>
    );
};


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
            <div className="h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No hay gastos para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="h-[250px] grid grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted) / 0.5)'}}
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            fontSize: '12px'
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={4}
                    >
                        {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="max-h-[250px] overflow-y-auto pr-2">
                 <CustomLegend payload={expenseData.map(item => ({...item, color: item.fill, payload: item, value: item.name}))}/>
            </div>
        </div>
    );
}

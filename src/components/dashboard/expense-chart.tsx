
'use client';

import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useData } from '@/context/data-context';
import { Skeleton } from '../ui/skeleton';
import type { Transaction } from '@/types';

const CustomizedContent = ({ root, depth, x, y, width, height, index, payload, rank, name, value }: any) => {
  const { formatCurrency } = useData();
  
  if (width < 50 || height < 30) {
    return null;
  }
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: payload.fill,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        className="text-xs font-medium"
      >
        {name}
      </text>
       <text
        x={x + width / 2}
        y={y + height / 2 + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        className="text-xs opacity-80"
      >
        {formatCurrency(value, false, true)}
      </text>
    </g>
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
            size: value,
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
                 <Treemap
                    data={expenseData}
                    dataKey="size"
                    ratio={4 / 3}
                    stroke="#fff"
                    content={<CustomizedContent />}
                >
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number, name: string) => [formatCurrency(value), name === 'size' ? 'Monto' : name]}
                    />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}

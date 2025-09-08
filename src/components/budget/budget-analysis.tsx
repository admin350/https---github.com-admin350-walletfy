
'use client';
import { useState, useMemo } from 'react';
import { useData } from '@/context/data-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

export function BudgetAnalysis() {
    const { budgets, transactions, isLoading, formatCurrency } = useData();
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | undefined>(budgets[0]?.id);

    const analysisData = useMemo(() => {
        if (!selectedBudgetId) return null;

        const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
        if (!selectedBudget) return null;

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const actualExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = 0;
                }
                acc[t.category] += t.amount;
                return acc;
            }, {} as Record<string, number>);

        const allCategories = new Set([
            ...selectedBudget.items.map(item => item.category),
            ...Object.keys(actualExpenses)
        ]);

        return Array.from(allCategories).map(category => {
            const budgetItem = selectedBudget.items.find(item => item.category === category);
            const plannedPercentage = budgetItem?.percentage ?? 0;
            const plannedAmount = totalIncome * (plannedPercentage / 100);
            const spentAmount = actualExpenses[category] ?? 0;
            const difference = plannedAmount - spentAmount;

            return {
                category,
                plannedPercentage,
                plannedAmount,
                spentAmount,
                difference,
            };
        });

    }, [selectedBudgetId, budgets, transactions]);

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />
    }

    if (budgets.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted-foreground">Crea un presupuesto para poder analizarlo.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div>
                <Select onValueChange={setSelectedBudgetId} defaultValue={selectedBudgetId}>
                    <SelectTrigger className="w-full md:w-1/3">
                        <SelectValue placeholder="Selecciona un presupuesto para analizar" />
                    </SelectTrigger>
                    <SelectContent>
                        {budgets.map(budget => (
                            <SelectItem key={budget.id} value={budget.id}>
                                {budget.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {analysisData && (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Presupuestado (%)</TableHead>
                                <TableHead className="text-right">Presupuestado ($)</TableHead>
                                <TableHead className="text-right">Gastado ($)</TableHead>
                                <TableHead className="text-right">Diferencia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analysisData.map(row => (
                                <TableRow key={row.category}>
                                    <TableCell className="font-medium">{row.category}</TableCell>
                                    <TableCell className="text-right">{row.plannedPercentage.toFixed(1)}%</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.plannedAmount)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.spentAmount)}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={row.difference >= 0 ? "default" : "destructive"} className={row.difference >= 0 ? "bg-green-500/20 text-green-500 border-green-500/20" : "bg-red-500/20 text-red-500 border-red-500/20"}>
                                            {formatCurrency(row.difference)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}


'use client';
import { useState } from "react";
import type { Budget, Transaction } from "@/types";
import { useData } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell, Layer } from "recharts";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AddBudgetDialog } from "./add-budget-dialog";
import { ChartContainer, ChartTooltipContent } from "../ui/chart";

interface BudgetWidgetProps {
    budgets: Budget[];
    isLoading: boolean;
}

export function BudgetWidget({ budgets, isLoading }: BudgetWidgetProps) {
    const { deleteBudget, transactions, categories, profiles, formatCurrency } = useData();
    const { toast } = useToast();

    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

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

    const handleEdit = (budget: Budget) => {
        setBudgetToEdit(budget);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBudget(id);
            toast({
                title: "Presupuesto eliminado",
                description: "Tu plan presupuestario ha sido eliminado."
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el presupuesto.",
                variant: "destructive"
            });
        }
    };
    
    const getCategoryColor = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        return category ? category.color : "#8884d8";
    };

    const getProfileColor = (profileName: string) => {
        const profile = profiles.find(p => p.name === profileName);
        return profile ? profile.color : "#8884d8";
    }

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />
    }

    if (!budgets || budgets.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No has creado ningún presupuesto aún.</p>
                <AddBudgetDialog>
                    <Button className="mt-4">Crear mi Primer Presupuesto</Button>
                </AddBudgetDialog>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {budgets.map(budget => {
                const chartData = budget.items.map(item => {
                    const budgetedAmount = totalIncome * (item.percentage / 100);
                    const spentAmount = actualExpenses[item.category] || 0;
                    return {
                        category: item.category,
                        budgeted: budgetedAmount,
                        spent: spentAmount,
                        remaining: Math.max(0, budgetedAmount - spentAmount),
                        fill: getCategoryColor(item.category)
                    };
                });
                
                const chartConfig = {
                    budgeted: { label: "Presupuestado" },
                    spent: { label: "Gastado" },
                };

                return (
                <Card key={budget.id} className="flex flex-col border-t-4 shadow-none border" style={{ borderTopColor: getProfileColor(budget.profile) }}>
                    <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{budget.name}</CardTitle>
                                 <CardDescription className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                    <span>Basado en Ingresos de: {formatCurrency(totalIncome)}</span>
                                     <Badge variant="outline">Perfil: {budget.profile}</Badge>
                                </CardDescription>
                            </div>
                             <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(budget)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem>
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el presupuesto.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(budget.id)}>Continuar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4">
                       <div className="h-[250px] w-full">
                           <ChartContainer config={chartConfig} className="w-full h-full">
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
                                    barSize={20}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="category"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                        width={120}
                                        className="truncate"
                                    />
                                    <Tooltip
                                        cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                                        content={<ChartTooltipContent 
                                            formatter={(value, name, props) => {
                                                const { payload } = props;
                                                const percentage = payload.budgeted > 0 ? (payload.spent / payload.budgeted) * 100 : 0;
                                                return (
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        <span className="font-bold" style={{ color: payload.fill }}>{payload.category}</span>
                                                        <span>Gastado: {formatCurrency(payload.spent)}</span>
                                                        <span>Presupuesto: {formatCurrency(payload.budgeted)}</span>
                                                        <span className="font-semibold">{percentage.toFixed(1)}% consumido</span>
                                                    </div>
                                                )
                                            }}
                                        />}
                                    />
                                    <Bar dataKey="budgeted" stackId="a" fill="hsl(var(--muted) / 0.5)" radius={[5, 5, 5, 5]} />
                                    <Bar dataKey="spent" stackId="a" radius={[5, 5, 5, 5]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.spent > entry.budgeted ? 'hsl(var(--destructive))' : entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                       </div>
                    </CardContent>
                </Card>
            )})}

            {budgetToEdit && (
                 <AddBudgetDialog
                    open={!!budgetToEdit}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) setBudgetToEdit(null);
                    }}
                    budgetToEdit={budgetToEdit}
                 >
                    <></>
                 </AddBudgetDialog>
            )}
        </div>
    )
}

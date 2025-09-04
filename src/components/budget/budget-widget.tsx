'use client';
import { useState } from "react";
import type { Budget } from "@/types";
import { useData } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
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
    const { deleteBudget, transactions, categories, profiles } = useData();
    const { toast } = useToast();

    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

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
        return category ? category.color : "#8884d8"; // fallback color
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
                 const chartData = budget.items.map(item => ({
                    ...item,
                    fill: getCategoryColor(item.category)
                }));
                const chartConfig = {
                    ...chartData.reduce((acc, item) => {
                        acc[item.category] = { label: item.category, color: item.fill };
                        return acc;
                    }, {} as any)
                };

                return (
                <Card key={budget.id} className="flex flex-col border-t-4 shadow-none border" style={{ borderTopColor: getProfileColor(budget.profile) }}>
                    <CardHeader className="p-4 pb-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{budget.name}</CardTitle>
                                 <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                    <span>Perfil:</span> <Badge variant="outline">{budget.profile}</Badge>
                                </div>
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
                       <div className="grid grid-cols-2 gap-4">
                           <div className="h-[150px]">
                             <ChartContainer
                                config={chartConfig}
                                className="h-full w-full"
                            >
                                <PieChart>
                                    <Tooltip
                                        cursor={false}
                                        content={<ChartTooltipContent 
                                            hideLabel
                                            formatter={(value, name) => `${name}: ${value}%`}
                                        />}
                                    />
                                    <Pie data={chartData} dataKey="percentage" nameKey="category" cx="50%" cy="50%" outerRadius={60} labelLine={false}>
                                        {chartData.map((entry) => (
                                            <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                           </div>
                            <div className="flex flex-col justify-center space-y-1 text-xs overflow-y-auto max-h-[150px] pr-2">
                                {chartData.map((item) => {
                                    const estimatedAmount = (totalIncome * item.percentage) / 100;
                                    return (
                                        <div key={item.category} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                                                <span className="truncate" title={item.category}>{item.category}</span>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className="font-medium">${estimatedAmount.toLocaleString('es-CL')}</span>
                                                <span className="ml-2 text-muted-foreground">({item.percentage}%)</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
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
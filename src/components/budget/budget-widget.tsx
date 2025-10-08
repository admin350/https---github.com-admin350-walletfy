
'use client';
import { useState } from "react";
import type { Budget } from "@/types";
import { useData } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoreVertical, Pencil, Trash2, Star } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AddBudgetDialog } from "./add-budget-dialog";
import { Progress } from "../ui/progress";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";


interface BudgetWidgetProps {
    budgets: Budget[];
    isLoading: boolean;
}

export function BudgetWidget({ budgets, isLoading }: BudgetWidgetProps) {
    const { deleteBudget, transactions, categories, profiles, formatCurrency, setFavoriteBudget } = useData();
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
        } catch (err) {
            const error = err as Error;
            toast({
                title: "Error",
                description: error.message || "No se pudo eliminar el presupuesto.",
                variant: "destructive"
            });
        }
    };
    
    const handleSetFavorite = async (id: string) => {
        try {
            await setFavoriteBudget(id);
            toast({
                title: "Presupuesto Favorito",
                description: "Se ha establecido como tu presupuesto principal para el dashboard.",
            });
        } catch (err) {
             const error = err as Error;
             toast({
                title: "Error",
                description: error.message || "No se pudo establecer el presupuesto como favorito.",
                variant: "destructive"
            });
        }
    }

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
        <div className="grid grid-cols-1 gap-6">
            {budgets.map(budget => {
                const categoryData = budget.items.map(item => {
                    const budgetedAmount = totalIncome * (item.percentage / 100);
                    const spentAmount = actualExpenses[item.category] || 0;
                    const progress = budgetedAmount > 0 ? (spentAmount / budgetedAmount) * 100 : 0;
                    return {
                        category: item.category,
                        budgeted: budgetedAmount,
                        spent: spentAmount,
                        progress: progress > 100 ? 100 : progress,
                        isOverBudget: spentAmount > budgetedAmount,
                        fill: getCategoryColor(item.category)
                    };
                });
                
                return (
                <Card key={budget.id} className="flex flex-col border-t-4 shadow-none bg-transparent" style={{ borderTopColor: getProfileColor(budget.profile) }}>
                    <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{budget.name}</CardTitle>
                                 <CardDescription className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                    <span>Basado en Ingresos de: {formatCurrency(totalIncome)}</span>
                                     <Badge variant="outline">Perfil: {budget.profile}</Badge>
                                </CardDescription>
                            </div>
                             <div className="flex items-center">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => handleSetFavorite(budget.id)}>
                                                <Star className={`h-4 w-4 ${budget.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Marcar como favorito en el Dashboard</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
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
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 space-y-4">
                       {categoryData.map(item => (
                            <div key={item.category}>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}/>
                                        <span>{item.category}</span>
                                    </div>
                                    <div className={`font-mono text-xs ${item.isOverBudget ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                        {formatCurrency(item.spent, false, true)} / {formatCurrency(item.budgeted, false, true)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="w-full">
                                                <Progress value={item.progress} className={`h-2 ${item.isOverBudget ? '[&>div]:bg-red-500' : ''}`} style={!item.isOverBudget ? { '--progress-color': item.fill } as React.CSSProperties : {}} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.progress.toFixed(1)}% consumido</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <span className="text-xs font-semibold w-12 text-right">{item.progress.toFixed(0)}%</span>
                                </div>
                            </div>
                       ))}
                    </CardContent>
                </Card>
            )})}

            {budgetToEdit && (
                 <AddBudgetDialog
                    open={!!budgetToEdit}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) setBudgetToEdit(null);
                    }}
                 >
                    <>{budgetToEdit.name}</>
                 </AddBudgetDialog>
            )}
        </div>
    )
}

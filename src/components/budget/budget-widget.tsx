

'use client';
import { useState, useContext } from "react";
import type { Budget } from "@/types";
import { DataContext } from "@/context/data-context";
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

interface BudgetWidgetProps {
    budgets: Budget[];
    isLoading: boolean;
}

export function BudgetWidget({ budgets, isLoading }: BudgetWidgetProps) {
    const { deleteBudget, transactions, categories, profiles } = useContext(DataContext);
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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {budgets.map(budget => (
                <Card key={budget.id} className="flex flex-col border-t-4" style={{ borderTopColor: getProfileColor(budget.profile) }}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{budget.name}</CardTitle>
                                 <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                    <span>Asignado al perfil</span> <Badge variant="outline">{budget.profile}</Badge>
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
                    <CardContent className="flex-1">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="h-[200px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={budget.items} dataKey="percentage" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                                        {budget.items.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                           </div>
                            <div className="flex flex-col justify-center space-y-2">
                                {budget.items.map((item, index) => (
                                    <div key={item.category} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(item.category) }} />
                                            <span>{item.category}</span>
                                        </div>
                                        <span className="font-medium">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                       </div>
                    </CardContent>
                    <CardFooter>
                         <p className="text-sm text-muted-foreground">Monto estimado basado en ingresos del período: <strong className="text-foreground">${((totalIncome * budget.items.reduce((sum, item) => sum + item.percentage, 0)) / 100).toLocaleString('es-CL')}</strong></p>
                    </CardFooter>
                </Card>
            ))}

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

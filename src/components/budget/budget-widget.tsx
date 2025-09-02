
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

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f", "#ffbb28"
];

export function BudgetWidget({ budgets, isLoading }: BudgetWidgetProps) {
    const { deleteBudget, transactions } = useContext(DataContext);
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
                <Card key={budget.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{budget.name}</CardTitle>
                                <CardDescription>
                                    Asignado al perfil <Badge variant="outline">{budget.profile}</Badge>
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
                    <CardContent className="flex-1">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="h-[200px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={budget.items} dataKey="percentage" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                                        {budget.items.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
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

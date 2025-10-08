
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddBudgetDialog } from "@/components/budget/add-budget-dialog";
import { BudgetWidget } from "@/components/budget/budget-widget";
import { useData } from "@/context/data-context";
import { BudgetAnalysis } from "@/components/budget/budget-analysis";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { PreviousMonthExpenseChart } from "@/components/budget/previous-month-expense-chart";

export default function BudgetPage() {
    const { budgets, isLoading, transactions, formatCurrency } = useData();
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <PreviousMonthExpenseChart />
                 <Card>
                    <CardHeader>
                        <CardTitle>Destino Real de tus Ingresos (Período Actual)</CardTitle>
                        <CardDescription>
                            Ingresos del período: <span className="font-bold text-primary">{formatCurrency(totalIncome)}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExpenseChart />
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Planes de Presupuesto</CardTitle>
                        <CardDescription>
                            Crea y gestiona tus planes.
                        </CardDescription>
                    </div>
                     <AddBudgetDialog>
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddBudgetDialog>
                </CardHeader>
                <CardContent>
                   <BudgetWidget budgets={budgets} isLoading={isLoading} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Análisis Comparativo del Presupuesto</CardTitle>
                    <CardDescription>
                        Compara tu presupuesto planificado con tus gastos reales del período seleccionado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BudgetAnalysis />
                </CardContent>
            </Card>
        </div>
    )
}

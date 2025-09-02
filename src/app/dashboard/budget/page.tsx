
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddBudgetDialog } from "@/components/budget/add-budget-dialog";
import { BudgetWidget } from "@/components/budget/budget-widget";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetAnalysis } from "@/components/budget/budget-analysis";
import { ExpenseChart } from "@/components/dashboard/expense-chart";

export default function BudgetPage() {
    const { budgets, isLoading } = useContext(DataContext);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Destino Real de tus Ingresos</CardTitle>
                        <CardDescription>
                            Visualización en tiempo real de cómo se distribuyen tus ingresos según los registros.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExpenseChart />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Mis Planes de Presupuesto</CardTitle>
                            <CardDescription>
                                Crea y gestiona tus planes.
                            </CardDescription>
                        </div>
                         <AddBudgetDialog>
                            <Button size="sm">
                               <PlusCircle className="mr-2 h-4 w-4 text-rose-400" />
                                Añadir
                            </Button>
                        </AddBudgetDialog>
                    </CardHeader>
                    <CardContent>
                       <BudgetWidget budgets={budgets} isLoading={isLoading} />
                    </CardContent>
                </Card>
            </div>

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

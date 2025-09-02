
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddBudgetDialog } from "@/components/budget/add-budget-dialog";
import { BudgetWidget } from "@/components/budget/budget-widget";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetPage() {
    const { budgets, isLoading } = useContext(DataContext);
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Presupuestos</CardTitle>
                        <CardDescription>
                            Crea y gestiona planes presupuestarios para analizar y optimizar tus finanzas.
                        </CardDescription>
                    </div>
                     <AddBudgetDialog>
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4 text-rose-400" />
                            Añadir Presupuesto
                        </Button>
                    </AddBudgetDialog>
                </CardHeader>
                <CardContent>
                   <BudgetWidget budgets={budgets} isLoading={isLoading} />
                </CardContent>
            </Card>
        </div>
    )
}

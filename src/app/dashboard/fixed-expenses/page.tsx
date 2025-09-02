
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FixedExpensesDataTable } from "@/components/transactions/fixed-expenses-data-table";
import { AddFixedExpenseDialog } from "@/components/transactions/add-fixed-expense-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function FixedExpensesPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Plantillas de Gastos Fijos</CardTitle>
                        <CardDescription>
                            Define tus gastos recurrentes. Úsalos como plantillas para registrar transacciones rápidamente.
                        </CardDescription>
                    </div>
                    <AddFixedExpenseDialog>
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4 text-indigo-400" />
                            Añadir Plantilla
                        </Button>
                    </AddFixedExpenseDialog>
                </CardHeader>
                <CardContent>
                    <FixedExpensesDataTable />
                </CardContent>
            </Card>
        </div>
    )
}

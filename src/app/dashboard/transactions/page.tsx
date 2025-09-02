
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionsDataTable } from "@/components/transactions/transactions-data-table";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { PlusCircle } from "lucide-react";

export default function TransactionsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Todas las Transacciones</CardTitle>
                        <CardDescription>
                            Aquí puedes ver, filtrar y gestionar todas tus transacciones.
                        </CardDescription>
                    </div>
                    <AddTransactionDialog>
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4 text-orange-400" />
                            Añadir Transacción
                        </Button>
                    </AddTransactionDialog>
                </CardHeader>
                <CardContent>
                    <TransactionsDataTable />
                </CardContent>
            </Card>
        </div>
    )
}

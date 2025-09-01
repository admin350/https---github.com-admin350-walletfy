import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function TransactionsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Todas las Transacciones</CardTitle>
                    <CardDescription>
                        Aquí se mostrará una tabla completa de todas las transacciones con opciones de filtrado y ordenación.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentTransactions />
                </CardContent>
            </Card>
        </div>
    )
}

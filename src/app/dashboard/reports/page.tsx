
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsDataTable } from "@/components/reports/reports-data-table";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informes Mensuales</CardTitle>
                    <CardDescription>
                        Historial de todos tus cierres de mes generados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportsDataTable />
                </CardContent>
            </Card>
        </div>
    )
}

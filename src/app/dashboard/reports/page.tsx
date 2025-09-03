
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsDataTable } from "@/components/reports/reports-data-table";
import { GenerateReportForm } from "@/components/reports/generate-report-form";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generador de Informes Mensuales con IA</CardTitle>
                    <CardDescription>
                        Selecciona un mes y un año para que la IA genere un análisis financiero detallado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <GenerateReportForm />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Informes</CardTitle>
                    <CardDescription>
                        Aquí puedes ver todos los informes que has generado anteriormente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportsDataTable />
                </CardContent>
            </Card>
        </div>
    )
}

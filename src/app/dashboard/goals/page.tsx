import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget";

export default function GoalsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Metas de Ahorro</CardTitle>
                    <CardDescription>
                        Un módulo para crear metas de ahorro con un monto objetivo y seguir el progreso a través de transferencias de ahorro.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <SavingsGoalsWidget />
                </CardContent>
            </Card>
        </div>
    )
}

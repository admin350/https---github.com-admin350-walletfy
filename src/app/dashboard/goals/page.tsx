import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget";

export default function GoalsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Metas</CardTitle>
                    <CardDescription>
                        Define tus metas financieras para dar un propósito a tus ahorros.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <SavingsGoalsWidget />
                </CardContent>
            </Card>
        </div>
    )
}

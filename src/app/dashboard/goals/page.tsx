import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget";

export default function GoalsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Savings Goals</CardTitle>
                    <CardDescription>
                        A module to create savings goals with a target amount and track progress via savings transfers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <SavingsGoalsWidget />
                </CardContent>
            </Card>
        </div>
    )
}

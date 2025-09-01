import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingPaymentsWidget } from "@/components/dashboard/upcoming-payments-widget";

export default function DebtsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Debts & Subscriptions</CardTitle>
                     <CardDescription>
                        A module to register debts with total amount, interest rate, and monthly payment, and to track recurring payments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpcomingPaymentsWidget />
                </CardContent>
            </Card>
        </div>
    )
}

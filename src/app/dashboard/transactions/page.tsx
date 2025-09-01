import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function TransactionsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>
                        A full table of all transactions with filtering and sorting options will be displayed here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentTransactions />
                </CardContent>
            </Card>
        </div>
    )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";

export default function GoalsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Metas</CardTitle>
                        <CardDescription>
                            Define tus metas financieras para dar un propósito a tus ahorros.
                        </CardDescription>
                    </div>
                     <AddGoalDialog>
                        <Button>
                           <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Meta
                        </Button>
                    </AddGoalDialog>
                </CardHeader>
                <CardContent>
                   <SavingsGoalsWidget />
                </CardContent>
            </Card>
        </div>
    )
}

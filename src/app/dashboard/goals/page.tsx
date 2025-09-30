'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, CheckCircle, PiggyBank } from "lucide-react";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useData } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SavingsGoal } from "@/types";

export default function GoalsPage() {
    const { goals, isLoading, formatCurrency } = useData();
    
    const totalGoals = goals.length;
    const totalTargetAmount = goals.reduce((acc: number, goal: SavingsGoal) => acc + goal.targetAmount, 0);

    const completedGoals = goals.filter((goal: SavingsGoal) => goal.currentAmount >= goal.targetAmount);
    const activeGoals = goals.filter((goal: SavingsGoal) => goal.currentAmount < goal.targetAmount);
    const completedGoalsCount = completedGoals.length;
    const completedGoalsAmount = completedGoals.reduce((acc: number, goal: SavingsGoal) => acc + goal.targetAmount, 0);

    const remainingAmount = goals.reduce((acc: number, goal: SavingsGoal) => {
        const remaining = goal.targetAmount - goal.currentAmount;
        return acc + (remaining > 0 ? remaining : 0);
    }, 0);

    const KpiSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )


    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <>
                        <KpiCard title="Metas Totales" value={<KpiSkeleton />} icon={Target} description="Cargando..." />
                        <KpiCard title="Metas Completadas" value={<KpiSkeleton />} icon={CheckCircle} description="Cargando..." />
                        <KpiCard title="Monto Restante" value={<KpiSkeleton />} icon={PiggyBank} description="Cargando..." />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            title="Metas Totales" 
                            value={totalGoals} 
                            icon={Target} 
                            description={`Presupuesto Total: ${formatCurrency(totalTargetAmount)}`}
                        />
                        <KpiCard 
                            title="Metas Completadas" 
                            value={completedGoalsCount} 
                            icon={CheckCircle}
                            description={`Monto Cumplido: ${formatCurrency(completedGoalsAmount)}`}
                        />
                        <KpiCard
                            title="Monto Restante"
                            value={formatCurrency(remainingAmount)}
                            icon={PiggyBank}
                            description="Para alcanzar todas tus metas"
                        />
                    </>
                )}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mis Metas</CardTitle>
                        <CardDescription>
                            Define, sigue y gestiona tus objetivos financieros.
                        </CardDescription>
                    </div>
                     <AddGoalDialog>
                        <Button size="icon" variant="outline">
                           <PlusCircle className="h-6 w-6" />
                        </Button>
                    </AddGoalDialog>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="active">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="active">Activas</TabsTrigger>
                            <TabsTrigger value="completed">Completadas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="active" className="mt-4">
                            <SavingsGoalsWidget goals={activeGoals} isLoading={isLoading} />
                        </TabsContent>
                        <TabsContent value="completed" className="mt-4">
                             <SavingsGoalsWidget goals={completedGoals} isLoading={isLoading} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

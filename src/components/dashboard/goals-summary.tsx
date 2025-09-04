
'use client';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';

export function GoalsSummary() {
    const { goals, isLoading } = useData();
    
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);

    if (isLoading) {
        return (
             <Card className="bg-card/50 border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                        <Target className="h-5 w-5" />
                        <span>Progreso de Metas</span>
                    </CardTitle>
                    <CardDescription>Un vistazo rápido al avance de tus metas activas.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                         <div className="space-y-2" key={i}>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                         </div>
                    ))}
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card className="bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Target className="h-5 w-5" />
                    <span>Progreso de Metas</span>
                </CardTitle>
                <CardDescription>Un vistazo rápido al avance de tus metas activas.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {activeGoals.length > 0 ? activeGoals.map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                        <div key={goal.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{goal.name}</span>
                                <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
                            </div>
                             <Progress value={progress} className="h-2 [&>div]:bg-yellow-400" />
                        </div>
                    )
                }) : (
                    <p className="text-sm text-muted-foreground text-center">No tienes metas activas en este momento.</p>
                )}
            </CardContent>
        </Card>
    )
}

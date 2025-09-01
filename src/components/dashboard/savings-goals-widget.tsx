'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState, useContext } from "react";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";

export function SavingsGoalsWidget() {
  const { goals, isLoading } = useContext(DataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Metas de Ahorro</CardTitle>
        <CardDescription>Tu progreso hacia tus objetivos financieros.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading || !isClient ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                 <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                 </div>
                 <Skeleton className="h-2 w-full" />
              </div>
            ))
          ) : goals.length === 0 ? (
             <p className="text-muted-foreground text-sm">No tienes metas de ahorro definidas.</p>
          ) : (
            goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {`$${goal.currentAmount.toLocaleString('es-CL')} / $${goal.targetAmount.toLocaleString('es-CL')}`}
                    </p>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

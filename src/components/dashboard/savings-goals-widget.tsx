'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

const goals = [
  { name: "Vacaciones a Japón", current: 3500000, target: 5000000 },
  { name: "Nuevo Portátil", current: 800000, target: 2000000 },
  { name: "Fondo de Emergencia", current: 4500000, target: 10000000 },
];

export function SavingsGoalsWidget() {
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
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div key={goal.name}>
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium">{goal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {isClient ? `$${goal.current.toLocaleString('es-CL')} / $${goal.target.toLocaleString('es-CL')}` : `$${goal.current} / $${goal.target}`}
                  </p>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

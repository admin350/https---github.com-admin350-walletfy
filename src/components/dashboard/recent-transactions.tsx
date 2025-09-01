'use client';
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const mockTransactions = [
  { type: "income", description: "Salario Mensual", amount: 2500000, category: "Ingresos" },
  { type: "expense", description: "Alquiler", amount: 800000, category: "Vivienda" },
  { type: "expense", description: "Compra Semanal", amount: 150750, category: "Comida" },
  { type: "expense", description: "Suscripción Netflix", amount: 15990, category: "Ocio" },
  { type: "income", description: "Proyecto Freelance", amount: 750000, category: "Ingresos" },
];


export function RecentTransactions() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
        <CardDescription>Las últimas 5 transacciones registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTransactions.map((t, i) => (
            <div key={i} className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                 {t.type === 'income' ? <ArrowUpRight className="h-5 w-5 text-green-500" /> : <ArrowDownLeft className="h-5 w-5 text-red-500" />}
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{t.description}</p>
                <Badge variant="outline">{t.category}</Badge>
              </div>
              <div className={`font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {isClient ? `${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString('es-CL')}`: `${t.type === 'income' ? '+' : '-'}$${t.amount}`}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

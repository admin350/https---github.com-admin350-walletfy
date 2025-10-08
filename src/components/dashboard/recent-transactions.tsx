
'use client';
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useData } from "@/context/data-context";
import { Skeleton } from "../ui/skeleton";

export function RecentTransactions() {
  const { transactions, isLoading, formatCurrency } = useData();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
        <CardDescription>Las últimas 5 transacciones registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading || !isClient ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 h-[44px]">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                   <Skeleton className="h-4 w-3/4" />
                   <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay transacciones registradas.</p>
          ) : (
            recentTransactions.map((t, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-9 w-9 flex items-center justify-center">
                   {t.type === 'income' ? <ArrowUpRight className="h-5 w-5 text-green-500" /> : <ArrowDownLeft className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.description}</p>
                  <Badge variant="outline">{t.category}</Badge>
                </div>
                <div className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {`${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, false)}`}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

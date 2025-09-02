
'use client';
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, PlusCircle, CreditCard, Receipt, Repeat } from "lucide-react";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { UpcomingPaymentsWidget } from "@/components/dashboard/upcoming-payments-widget";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddDebtDialog } from "@/components/transactions/add-debt-dialog";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";
import { useState, useEffect, useContext } from "react";
import { AddFixedExpenseDialog } from "@/components/transactions/add-fixed-expense-dialog";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialAnalysisIA } from "@/components/dashboard/financial-analysis-ia";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { transactions, goals, isLoading } = useContext(DataContext);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  const KpiSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading || !isClient ? (
          <>
            <KpiCard title="Ingresos del Mes" value={<KpiSkeleton />} icon={TrendingUp} description="Cargando..." />
            <KpiCard title="Egresos del Mes" value={<KpiSkeleton />} icon={TrendingDown} description="Cargando..." />
            <KpiCard title="Balance Neto" value={<KpiSkeleton />} icon={DollarSign} description="Cargando..." />
            <KpiCard title="Tasa de Ahorro" value={<KpiSkeleton />} icon={PiggyBank} description="Cargando..." />
          </>
        ) : (
          <>
            <KpiCard title="Ingresos del Mes" value={`$${totalIncome.toLocaleString('es-CL')}`} icon={TrendingUp} description="Este es el 100% del presupuesto" />
            <KpiCard title="Egresos del Mes" value={`$${totalExpenses.toLocaleString('es-CL')}`} icon={TrendingDown} description={`${totalIncome > 0 ? ((totalExpenses/totalIncome)*100).toFixed(1) : 0}% del ingreso`} />
            <KpiCard title="Balance Neto" value={`$${netBalance.toLocaleString('es-CL')}`} icon={DollarSign} description="Ingresos - Egresos" />
            <KpiCard title="Tasa de Ahorro" value={`${savingsRate.toFixed(1)}%`} icon={PiggyBank} description="Porcentaje de ingresos no gastado" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CashflowChart />
        </div>
        <div className="lg:col-span-2">
          <ExpenseChart />
        </div>
      </div>
      
      <FinancialAnalysisIA />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <RecentTransactions />
        <UpcomingPaymentsWidget />
      </div>

      <div className="fixed bottom-6 right-6">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="lg" className="rounded-full shadow-lg h-16 w-16">
                    <PlusCircle className="h-8 w-8" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mb-2">
                <AddTransactionDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Receipt className="mr-2 h-4 w-4" />
                        Añadir Transacción
                    </DropdownMenuItem>
                </AddTransactionDialog>
                 <AddDebtDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Añadir Deuda
                    </DropdownMenuItem>
                </AddDebtDialog>
                <AddSubscriptionDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <PiggyBank className="mr-2 h-4 w-4" />
                        Añadir Suscripción
                    </DropdownMenuItem>
                </AddSubscriptionDialog>
                 <AddFixedExpenseDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Repeat className="mr-2 h-4 w-4" />
                        Añadir Gasto Fijo
                    </DropdownMenuItem>
                </AddFixedExpenseDialog>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

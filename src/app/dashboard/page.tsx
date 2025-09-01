'use client';
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, PlusCircle, CreditCard, Receipt } from "lucide-react";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget";
import { UpcomingPaymentsWidget } from "@/components/dashboard/upcoming-payments-widget";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddDebtDialog } from "@/components/transactions/add-debt-dialog";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalIncome = 5000;
  const totalExpenses = 2750;
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = (netBalance / totalIncome) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isClient ? (
          <>
            <KpiCard title="Ingresos del Mes" value={`$${totalIncome.toLocaleString('es-ES')}`} icon={TrendingUp} description="Este es el 100% del presupuesto" />
            <KpiCard title="Egresos del Mes" value={`$${totalExpenses.toLocaleString('es-ES')}`} icon={TrendingDown} description={`${((totalExpenses/totalIncome)*100).toFixed(1)}% del ingreso`} />
            <KpiCard title="Balance Neto" value={`$${netBalance.toLocaleString('es-ES')}`} icon={DollarSign} description="Ingresos - Egresos" />
            <KpiCard title="Tasa de Ahorro" value={`${savingsRate.toFixed(1)}%`} icon={PiggyBank} description="Porcentaje de ingresos no gastado" />
          </>
        ) : (
          <>
            <KpiCard title="Ingresos del Mes" value="$5000" icon={TrendingUp} description="Este es el 100% del presupuesto" />
            <KpiCard title="Egresos del Mes" value="$2750" icon={TrendingDown} description="55.0% del ingreso" />
            <KpiCard title="Balance Neto" value="$2250" icon={DollarSign} description="Ingresos - Egresos" />
            <KpiCard title="Tasa de Ahorro" value="45.0%" icon={PiggyBank} description="Porcentaje de ingresos no gastado" />
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RecentTransactions />
        <UpcomingPaymentsWidget />
        <SavingsGoalsWidget />
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
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

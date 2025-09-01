import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, PlusCircle } from "lucide-react";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SavingsGoalsWidget } from "@/components/dashboard/savings-goals-widget";
import { UpcomingPaymentsWidget } from "@/components/dashboard/upcoming-payments-widget";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const totalIncome = 5000;
  const totalExpenses = 2750;
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = (netBalance / totalIncome) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Ingresos del Mes" value={`$${totalIncome.toLocaleString()}`} icon={TrendingUp} description="Este es el 100% del presupuesto" />
        <KpiCard title="Egresos del Mes" value={`$${totalExpenses.toLocaleString()}`} icon={TrendingDown} description={`${((totalExpenses/totalIncome)*100).toFixed(1)}% del ingreso`} />
        <KpiCard title="Balance Neto" value={`$${netBalance.toLocaleString()}`} icon={DollarSign} description="Ingresos - Egresos" />
        <KpiCard title="Tasa de Ahorro" value={`${savingsRate.toFixed(1)}%`} icon={PiggyBank} description="Porcentaje de ingresos no gastado" />
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
        <AddTransactionDialog>
          <Button size="lg" className="rounded-full shadow-lg">
            <PlusCircle className="mr-2 h-6 w-6" />
            Añadir Transacción
          </Button>
        </AddTransactionDialog>
      </div>
    </div>
  );
}

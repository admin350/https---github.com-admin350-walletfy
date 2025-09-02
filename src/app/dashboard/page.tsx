
'use client';
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, PlusCircle, CreditCard, Receipt, Repeat, Wallet, Landmark } from "lucide-react";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddDebtDialog } from "@/components/transactions/add-debt-dialog";
import { AddSubscriptionDialog } from "@/components/transactions/add-subscription-dialog";
import { useState, useEffect, useContext } from "react";
import { AddFixedExpenseDialog } from "@/components/transactions/add-fixed-expense-dialog";
import { DataContext } from "@/context/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialAnalysisIA } from "@/components/dashboard/financial-analysis-ia";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { GoalsSummary } from "@/components/dashboard/goals-summary";

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { transactions, goalContributions, isLoading } = useContext(DataContext);

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
  
  const totalSavings = transactions.filter(t => t.type === 'transfer').reduce((acc, t) => acc + t.amount, 0);
  const totalContributedToGoals = goalContributions.reduce((acc, c) => acc + c.amount, 0);
  const availableSavings = totalSavings - totalContributedToGoals;

  const totalToInvestment = transactions.filter(t => t.type === 'transfer-investment').reduce((acc, t) => acc + t.amount, 0);

  const KpiSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading || !isClient ? (
          <>
            <KpiCard title="Ingresos del Período" value={<KpiSkeleton />} icon={TrendingUp} description="Cargando..." />
            <KpiCard title="Egresos del Período" value={<KpiSkeleton />} icon={TrendingDown} description="Cargando..." />
            <KpiCard title="Balance Neto" value={<KpiSkeleton />} icon={DollarSign} description="Cargando..." />
            <KpiCard title="Tasa de Ahorro" value={<KpiSkeleton />} icon={PiggyBank} description="Cargando..." />
            <KpiCard title="Saldo Disponible para Aportar" value={<KpiSkeleton />} icon={Wallet} description="Cargando..." />
            <KpiCard title="Inversiones del Período" value={<KpiSkeleton />} icon={Landmark} description="Cargando..." />
          </>
        ) : (
          <>
            <KpiCard 
              title="Ingresos del Período" 
              value={<span className="text-green-500">${totalIncome.toLocaleString('es-CL')}</span>} 
              icon={TrendingUp} 
              iconClassName="text-green-500"
              description="Suma de ingresos en el período." 
            />
            <KpiCard 
              title="Egresos del Período" 
              value={<span className="text-red-500">${totalExpenses.toLocaleString('es-CL')}</span>} 
              icon={TrendingDown}
              iconClassName="text-red-500"
              description={`${totalIncome > 0 ? ((totalExpenses/totalIncome)*100).toFixed(1) : 0}% del ingreso`} 
            />
            <KpiCard 
              title="Balance Neto" 
              value={<span className={netBalance >= 0 ? 'text-green-500' : 'text-red-500'}>${netBalance.toLocaleString('es-CL')}</span>} 
              icon={DollarSign}
              iconClassName={netBalance >= 0 ? 'text-green-500' : 'text-red-500'}
              description="Ingresos - Egresos" 
            />
            <KpiCard 
              title="Tasa de Ahorro" 
              value={`${savingsRate.toFixed(1)}%`} 
              icon={PiggyBank}
              iconClassName="text-emerald-400"
              description="Porcentaje de ingresos no gastado" 
            />
             <KpiCard 
              title="Saldo Disponible para Aportar" 
              value={<span className="text-green-500">${availableSavings.toLocaleString('es-CL')}</span>} 
              icon={Wallet} 
              iconClassName="text-green-500"
              description="De tu cartera de ahorros." 
            />
             <KpiCard 
              title="Inversiones del Período" 
              value={<span className="text-blue-400">${totalToInvestment.toLocaleString('es-CL')}</span>} 
              icon={Landmark} 
              iconClassName="text-blue-400"
              description="Total transferido a tu cartera de inversión." 
            />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialSummary />
        <GoalsSummary />
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


'use client';
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, PlusCircle, CreditCard, Receipt, Repeat, Wallet, Landmark } from "lucide-react";
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
import { OverdueDebtsWidget } from "@/components/dashboard/overdue-debts-widget";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { FinancialSummary } from "@/components/dashboard/financial-summary";


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { transactions, isLoading } = useContext(DataContext);

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

  const KpiSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OverdueDebtsWidget />

          <div className="grid gap-4 md:grid-cols-3">
              {isLoading || !isClient ? (
              <>
                  <KpiCard title="Ingresos del Período" value={<KpiSkeleton />} icon={TrendingUp} description="Cargando..." />
                  <KpiCard title="Egresos del Período" value={<KpiSkeleton />} icon={TrendingDown} description="Cargando..." />
                  <KpiCard title="Balance Neto" value={<KpiSkeleton />} icon={DollarSign} description="Cargando..." />
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
              </>
              )}
          </div>
          
          <CashflowChart />

          <FinancialAnalysisIA />

        </div>

        <div className="lg:col-span-1 space-y-6">
            <FinancialSummary />
            <RecentTransactions />
        </div>
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
